export function tokenize (str) {
    return str
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .match(/\[[^\]]+\]|\S+\[[^\]]+\]|\S+/g);
}

export function parse (program) {
    return read_from_tokens( tokenize(program) );
}

export function read_from_tokens (tokens) {
    if ( tokens.length == 0 )
        throw 'unexpected EOF'

    token = tokens.shift();

    if ( token == '(' ) {
        let l = [];

        while ( tokens[0] != ')' )
            l.push( read_from_tokens(tokens) );

        tokens.shift(); // Pop ')'
        return l
    }
    else if ( token == ')' )
        throw 'unexpected )';
    else // Atom
        return atom(token);
}

export function atom (token) {
    if ( !isNaN( Number(token) ) )
        return Number(token);
    else return token;
}

export function evaluate (x, env) {
    if ( typeof(x) == 'string' ) { // Symbol
        return env.find(x)[x];
    }
    else if ( !(x instanceof Array) ) // Constant
        return x;

    const op = x[0];
    const args = x.slice(1);

    if ( op == 'quote' ) // Quotation
        return args[0];
    else if ( x[0] == 'if' ) {
        const [test, conseq, alt] = args;
        const exp = evaluate(test, env) ? conseq : alt;
        return evaluate(exp, env);
    }
    else if ( x[0] == 'define' ) {
        [symbol, exp] = args;

        // Don't allow defs to be overwritten
        if ( symbol == 'defs' )
            throw new ValError('"defs" is a reserved word. Cannot be used with define');

        // Used for serializing AST
        env.defs[symbol] = exp;

        env[symbol] = evaluate(exp, env);
    }
    else if ( x[0] == 'lambda' ) {
        const [params, body] = args;
        return Procedure(params, body, env);
    }
    else { // Procedure call
        const proc = evaluate(op, env);
        const a = args.map( e => evaluate(e, env) );
        //console.log('in env: ' + JSON.stringify(env));
        //console.log('call: ' + JSON.stringify(op) + ' on ' + JSON.stringify(a));
        return proc(...a);
    }
}

export class Env {
    constructor(params=[], args=[], outer=null) {
        for (let i = 0; i < params.length; i++)
            this[ params[i] ] = args[i];
        this.outer = outer;
    }

    find(v) {
        if ( this[v] != undefined ) return this;
        else {
            if ( !this.outer )
                throw new SubstError('Could not find ' + v + ' in top level env: ' + JSON.stringify(this));
            return this.outer.find(v);
        }
        //return this[v] ? this : return this.outer.find(v);
    }
}

export function Procedure (params, body, env) {
    function f () {
        return evaluate(body, new Env(params, arguments, env));
    };
    return setArity(params.length, f);
}

/*
export function serializeDef(symbol, expr) {
    if ( expr instanceof Array ) {
        console.log( '(' + expr.map(serializeDef).join(' ') + ')' );
        return '(' + expr.map(serializeDef).join(' ') + ')';
    }
    else
        return String(expr);
}
*/

function setArity (arity, fn) {
    if (typeof arity !== 'number')
        throw new TypeError('Expected arity to be a number, got ' + arity);

    let params = [];
    for (var i = 0; i < arity; i++)
        params.push('_' + i);

    return new Function(
        'fn',
        'return function f(' + params.join(', ') + ') { return fn.apply(this, arguments); }'
    )(fn);
};

export function std_env () {
    let std_env = new Env();
    std_env['+'] = (x,y) => { return x+y; };
    std_env['*'] = (x,y) => { return x*y; };
    std_env['-'] = (x,y) => { return x-y; };
    std_env['/'] = (x,y) => { return x/y; };
    std_env['='] = (x,y) => { return x == y; };
    std_env['car'] = (l) => {
        if ( l == 'nil' )
            return l;
        if ( !(l instanceof Array) )
            throw new ValError('argument to car: ' + l + ' is not a list');
        if ( l.length == 0 )
            return 'nil';
        return l[0];
    };
    std_env['cdr'] = (l) => {
        if ( l == 'nil' )
            return l;
        if ( !(l instanceof Array) )
            throw new ValError('argument to car: ' + l + ' is not a list');
        if ( l.length == 0 )
            return 'nil';
        return l.slice(1)
    };
    std_env['cons'] = (h,t) => { return [h].concat(t).concat('nil'); };
    std_env['map'] = (l,f) => { return l.map(f) };
    std_env['defToStr'] = (d) => {
        // TODO: Take env as a parameter so that define can exist in sub-contexts
        if ( !d ) return JSON.stringify(std_env.defs);
        else return JSON.stringify( std_env.defs[d] );
    };
    std_env['import'] = (s) => {
        const imports = JSON.parse(s);
        std_env.defs = {...std_env.defs, ...imports};
        for ( [name,body] of Object.entries(imports) )
            std_env[name] = evaluate(body, std_env);
    };

    // Update with new definition ast's
    std_env['defs'] = {};

    return std_env;
}

export function importDefs (imports, env) {
    for ( let [name,body] of Object.entries(imports) )
        env[name] = evaluate(body, env);
}

export function parseCells (expr, env) {
    // String literal
    if ( expr instanceof Array )
        return expr.map( e => parseCells(e, env) );

    // String literal
    //if ( expr.match(/\".*\"/) )
        //return expr.split('"')[1];
    // Number literal
    //else if ( expr.match(/[0-9]*/)[0] == expr )
    else if ( !isNaN( Number(expr) ) )
        return Number(expr);
    // Symbol or reference
    else {
        const v = env[expr];
        // A reference is how blocks are composed in the UI
        if (v) return v.elems.map( e => parseCells(e, env) );
        // If v is not in env, it must be a symbol (string)
        else return expr;
    }
}

export function SubstError(message) {
    this.name = 'SubstError';
    this.message = message;

    this.toString = () => {
        return this.name + ': ' + this.message;
    }
}

export function ValError(message) {
    this.name = 'ValError';
    this.message = message;

    this.toString = () => {
        return this.name + ': ' + this.message;
    }
}


// Global store of user-defined definition bodies for serializing
//export var defs = {};

/*
console.log( evaluate(parse(
    '(map (cons 1 2) (lambda x (+ x 1)))')
    ,std_env()) );
*/
/*
console.log(
    serialize(parse('(map (cons 1 2) (lambda x (+ x 1)))')))
*/
