function cellToString (cell) {
    return '(cons ' + cell.car + ' ' + cell.cdr + ')';
}

function deepCellToString (cell, context) {
    console.log(cell)
    let car = parse( cell.car, context );
    let cdr = parse( cell.cdr, context );

    return '(cons ' + car + ' ' + cdr + ')';
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
        // Quote a symbol
        else return "'" + expr;
    }
}

function compile (src_cell, cells) {
    let context = {};
    cells.forEach( c => { context[ c.name ] = c });

    return deepCellToString(src_cell, context);
}
