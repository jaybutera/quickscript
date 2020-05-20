function cellToString (cell) {
    return '(' + cell.elems.join(' ') + ')';
}

function deepCellToString (cell, context) {
    let deepElems = cell.elems.map( e => parse(e, context) );
    return '(' + deepElems.join(' ') + ')';
}

function parse (expr, context) {
    // String literal
    if ( expr.match(/\".*\"/) )
        return expr;
    // Number literal
    else if ( expr.match(/[0-9]*/)[0] == expr )
        return expr;
    // Sub-expression or symbol
    else {
        let v = context[expr];
        if (v) return deepCellToString(v, context);
        // If not in the context, treat it as a symbol
        else return expr;
    }
}

// Parses the visual structure into an AST
// BUT, symbols are not parsed, they are left as symbols
// This is because this context refers to the visual references, not the REPL values
function parseToAST (expr, refs) {
    // String literal
    if ( expr.match(/\".*\"/) )
        return {
            type: 'string',
            value: expr.split('"')[1],
        };
    // Number literal
    else if ( expr.match(/[0-9]*/)[0] == expr )
        return {
            type: 'number',
            value: Number(expr),
        };
    // Symbol or reference
    else {
        let v = refs[expr];
        // Parse a reference recursively
        if (v) return {
            type: 'list',
            value: v.elems.map( e => parseToAst(v, refs) ),
        }
        // If not in the refs, treat it as a symbol
        else return {
            type: 'symbol',
            value: expr,
        };
    }
}

// Second parsing pass-through takes the AST and expands symbols given a context
function parseSymbols (ast, context) {
    if ( ast.type == 'list' )
        return {
            type: 'list',
            value: ast.value.map( e => parseSymbols(e, context) ),
        };
    else if ( ast.type == 'symbol') {
        const v = context[ ast.value ];
        if ( !v )
            console.log('Error: symbol was not found in context:', ast.value);
        return v;
    }
    else
        return ast;
}

function eval (s_expr/*, context*/) {
    // Assume s_expr is a parsed AST node
    if ( s_expr.type != 'list' )
        return s_expr.value;

    // (Lookup?) the first element
    const elems = s_expr.value;
    const f = elems[0];
    if ( !f )
        return 'Error: f is not in context';
    if ( f.type != 'lambda' )
        return 'Error: first element is not a function, its a ' + f.type;

    // Return function output
    const args = elems.slice(1).map( e => e.value );
    return f.value( args );
}

function compile (src_cell, cells, context) {
    //let lexical_context = {};
    cells.forEach( c => { context[ c.name ] = c });

    //return exprAsString(src_cell, context);
    const firstAST = {
        type: 'list',
        value: src_cell.elems.map( e => parseToAST(e, context) ),
    };
    const AST = parseSymbols(firstAST, std_lib);
    return JSON.stringify( eval(AST, std_lib) );
    //return JSON.stringify( deepElems );
}

const std_lib = {
    '+' : {
        type: 'lambda',
        value: ([x,y]) => x+y,
    },
}

/*
 * eq?
 * quote
 * cons
 * car
 * cdr
 * atom?
 * define
 * lambda
 * cond
 */
