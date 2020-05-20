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

function parseToAST (expr, context) {
    console.log(expr)
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
        let v = context[expr];
        // Parse a reference recursively
        if (v) return {
            type: 'list',
            value: v.elems.map( e => parseToAst(v, context) ),
        }
        // If not in the context, treat it as a symbol
        else return {
            type: 'symbol',
            value: expr,
        };
    }
}

/*
function exprAsString (expr, context) {
    console.log(expr)
    let deepElems = expr.elems.map( e => {
        //let v = context[e];

        // Sub-expression
        if ( e.match(/\(.*\)/)[0] == e )
            return exprAsString(e, context);
        else
            //return exprAsString(e, context)
            return e;
    });

    return '(' + deepElems.join(' ') + ')';
}
*/

function compile (src_cell, cells, context) {
    //let lexical_context = {};
    cells.forEach( c => { context[ c.name ] = c });

    //return exprAsString(src_cell, context);
    let deepElems = src_cell.elems.map( e => parseToAST(e, context) );
    return JSON.stringify( deepElems );
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
