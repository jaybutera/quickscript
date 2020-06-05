document.getElementById('var-name').onkeyup = () => {
    scene.setCellValue( document.getElementById('var-name').value );
};

document.getElementById('compile').onclick = () => {
    let src_cell = scene.context[ scene.selected[0] ];
    let cons_list = scene.cells.filter( c => c.type == 'list');

    // Evaluate
    let result;
    try {
        result = eval(
            parseCells(src_cell.elems, {...new Env(), ...scene.context}),
            global_env);
    } catch (e) {
        result = e;
    }

    // Resave definitions incase there is an update
    localStorage.setItem('defs', JSON.stringify(defs));

    // Output
    document.getElementById('lisp-code').value = result;
    //alert(result);

    // Re-print the context
    drawContext();
};

document.getElementById('new-connect').onclick = () => { scene.connecting = true; };
document.getElementById('new-cell').onclick = () => {
    let size = parseInt( document.getElementById('list-size').value );
    let l = Array.apply(null, Array(size)).map( _ => '');
    scene.addList(10,10, l);
}
document.getElementById('remove-cons').onclick = () => {
    scene.removeCell( scene.selected[0] );
}

window.onorientationchange = () => {
    fitToContainer(canvas, scene);
}
window.onresize = () => {
    fitToContainer(canvas, scene);
};

// listen for mouse events
canvas.onmousedown = scene.mouseDownEvent.bind(scene);
canvas.onmouseup = scene.mouseUpEvent.bind(scene);
canvas.onmousemove = scene.mouseMoveEvent.bind(scene);

canvas.ontouchstart =
    scene.touchDownEvent.bind(scene);
canvas.ontouchend =
    scene.touchUpEvent.bind(scene);
canvas.ontouchmove =
    scene.touchMoveEvent.bind(scene);

// call to draw the scene initially
scene.draw();

let dragged_fn;

function fnToCell (fname, env) {
    // Include special form functions
    for ( const [k,arity] of Object.entries(special_fns) )
        if ( k == fname )
            return [fname]
                .concat(Array.apply(null, Array(arity)).map( _ => ''));

    // Otherwise look in env
    const f = env[dragged_fn];
    return [dragged_fn]
        .concat(Array.apply(null, Array(f.length)).map( _ => ''));
}

document.ondrop = (e) => {
    if ( isInCanvas(e.clientX, e.clientY) ) {
        const empty_cell = fnToCell(dragged_fn, global_env);
        scene.addList(e.clientX, e.clientY, empty_cell);
    }
};
document.ondragstart = (e) => { dragged_fn = e.target.innerHTML; };
document.ondragover = e => {
    if ( e.target.id == 'myCanvas' )
        e.preventDefault();
};

document.ontouchmove = e => {
    if ( e.target.className == 'li-function' ) {
        e.preventDefault();
        e.stopPropagation();
    }
}

document.ontouchstart = e => {
    if ( e.target.className == 'li-function' ) {
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        dragged_fn = e.target.innerHTML;
    }
};

document.ontouchend = (e => {
    if ( e.target.className == 'li-function' ) {
        const touch = e.changedTouches[0];
        const mouseEvent = new MouseEvent("drop", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        document.dispatchEvent( mouseEvent );
    }
});
