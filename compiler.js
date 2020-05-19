function cellToString (cell) {
    return '(' + cell.elems.join(' ') + ')';
}

function deepCellToString (cell, context) {
    let deepElems = cell.elems.map( e => parse(e, context) );
    return '(' + deepElems.join(' ') + ')';
}

function parse (expr, context) {
    // String literal
    console.log(expr)
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

function compile (src_cell, cells) {
    let context = {};
    cells.forEach( c => { context[ c.name ] = c });

    return deepCellToString(src_cell, context);
}
