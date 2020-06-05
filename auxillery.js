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
        defs = {...defs, ...data}
        importDefs(data, global_env);
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
