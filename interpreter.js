function tokenize (str) {
    return str
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .match(/\[[^\]]+\]|\S+\[[^\]]+\]|\S+/g);
}

function parse (program) {
    return read_from_tokens( tokenize(program) );
}

function read_from_tokens (tokens) {
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

function atom (token) {
    if ( Number(token) )
        return Number(token);
    else return token;
}

function eval (x, env) {
    //console.log('x:', x)
    //console.log('env:', env)
    if ( typeof(x) == 'string' ) // Symbol
        return env.find(x)[x];
    else if ( !(x instanceof Array) ) // Constant
        return x;

    const op = x[0];
    const args = x.slice(1);

    if ( op == 'quote' ) // Quotation
        return args[0];
    else if ( x[0] == 'if' ) {
        [test, conseq, alt] = args;
        const exp = (eval(test, env) ? conseq : alt);
        return eval(exp, env);
    }
    else if ( x[0] == 'define' ) {
        [symbol, exp] = args;
        env[symbol] = eval(exp, env);
    }
    else if ( x[0] == 'lambda' ) {
        [params, body] = args;
        return Procedure(params, body, env);
    }
    else { // Procedure call
        const proc = eval(op, env);
        const a = args.map( e => eval(e, env) );
        console.log('proc: ', proc)
        console.log('args: ', a)
        return proc(...a);
    }
}

class Env {
    constructor(params=[], args=[], outer=null) {
        for (let i = 0; i < params.length; i++)
            this[ params[i] ] = args[i];
        this.outer = outer;
    }

    find(v) {
        return this[v] ? this : this.outer.find(v);
    }
}

function Procedure (params, body, env) {
    function f () {
        return eval(body, new Env(params, arguments, env));
    };
    return setArity(params.length, f);
}

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

function std_env () {
    const std_env = new Env();
    std_env['+'] = (x,y) => { return x+y; };
    std_env['*'] = (x,y) => { return x*y; };
    std_env['-'] = (x,y) => { return x-y; };
    std_env['/'] = (x,y) => { return x/y; };
    std_env['car'] = (l) => { return l[0]; };
    std_env['cdr'] = (l) => { return l.slice(1) };
    std_env['cons'] = (h,t) => { return [h].concat(t) };
    std_env['map'] = (l,f) => { return l.map(f) };

    return std_env;
}

function serialize (expr) {
    if ( expr instanceof Array )
        return '(' + expr.map(serialize).join(' ') + ')'
    else
        return String(expr)
}

function parseCells (expr, env) {
    // String literal
    if ( expr instanceof Array )
        return expr.map( e => parseCells(e, env) );

    if ( expr.match(/\".*\"/) )
        return expr.split('"')[1];
    // Number literal
    //else if ( expr.match(/[0-9]*/)[0] == expr )
    else if ( Number(expr) )
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

/*
console.log( eval(parse(
    '(map (cons 1 2) (lambda x (+ x 1)))')
    ,std_env()) );
*/
/*
console.log(
    serialize(parse('(map (cons 1 2) (lambda x (+ x 1)))')))
*/
