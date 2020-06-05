import * as Interp from './interpreter.js';

let canvas = document.getElementById('myCanvas');
fitToContainer(canvas, null);

let ctx = canvas.getContext('2d');

let cells = [
    newList(10, 50, ['define', 'test', '']),
    newList(10, 100, ['lambda', 'x', 'x']),
];

// Special form functions and their arity
const special_fns = {
    'lambda': 2,
    'quote': 1,
    'define': 2,
    'if': 3,
};

let scene = new Scene(canvas, ctx, cells);
// A repl context for our definitions
let global_env = Interp.std_env();

// Load in any locally saved std env and definitions
loadLocalEnv(global_env);
drawContext();



function isInCanvas (x,y) {
    const box = document.getElementById('myCanvas')
                 .getBoundingClientRect();

    if (   x > box.left && x < box.right
        && y > box.top && y < box.bottom)
        return true;
    else return false;
}

function fitToContainer (canvas, scene) {
    // Make it visually fill the positioned parent
    const p = document.getElementById('main');
    canvas.width  = p.offsetWidth;//window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    canvas.height = p.offsetHeight;//window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;

    if ( scene )
        scene.draw();
}

function loadLocalEnv (global_env) {
    const loc_defs   = localStorage.getItem('defs');
    if ( loc_defs != 'undefined' && loc_defs ) {
        const data = JSON.parse(loc_defs);
        global_env.defs = {...global_env.defs, ...data}
        Interp.importDefs(data, global_env);
    }
}

function drawContext () {
    const ul = document.getElementById('context');
    // Clear
    ul.innerHTML = '';

    // Redraw
    Object.keys(special_fns)
        .concat( Object.keys(global_env) )
        .forEach( k => {

        if (k == 'outer') return;

        const li  = document.createElement('li');
        const div = document.createElement('div');
        //const p   = document.createElement('p');

        div.classList.add('li-function');
        //p.appendChild( document.createTextNode(k) );
        div.draggable = true;
        div.appendChild( document.createTextNode(k) );
        //div.appendChild(p);

        li.appendChild(div);
        ul.appendChild( li );
    });
}


document.getElementById('var-name').onkeyup = () => {
    scene.setCellValue( document.getElementById('var-name').value );
};

document.getElementById('compile').onclick = () => {
    let src_cell = scene.context[ scene.selected[0] ];
    let cons_list = scene.cells.filter( c => c.type == 'list');

    // Evaluate
    let result;
    try {
        result = evaluate(
            parseCells(src_cell.elems, {...new Env(), ...scene.context}),
            global_env);
    } catch (e) {
        result = e;
    }

    // Resave definitions incase there is an update
    localStorage.setItem('defs', JSON.stringify(global_env.defs));

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
    // Special form functions and their arity
    const special_fns = {
        'lambda': 2,
        'quote': 1,
        'define': 2,
        'if': 3,
    };

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
