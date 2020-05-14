const CELL_WIDTH = 100;
const CELL_HEIGHT = 30;

// An algorithmic global name generator
// TODO: Change this to a hash of the object being named
var name_counter = 0;
function genConsName() {
    let n = 'x' + name_counter;
    name_counter += 1;
    return n;
}

// If no name is given, algorithmically assign one
function newConsCell (x, y, car="", cdr="nil", name=genConsName()) {
    return {
        type: 'cons',
        name: name,
        car: car,
        cdr: cdr,
        x: x,
        y: y,
        isDragging: false,
    }
}

function newLine (x0,y0,x1,y1, from="", from_is_car=false, to="") {
    return {
        type: 'line',
        from: from, // name of object the line starts from
        to: to,
        from_is_car: from_is_car,
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
    };
}

class Scene {
    constructor(canvas, ctx, cells) {
        this.ctx = ctx;
        this.BB  = canvas.getBoundingClientRect();
        this.offsetX = this.BB.top;
        this.offsetY = this.BB.top;
        this.WIDTH   = canvas.width;
        this.HEIGHT  = canvas.height;

        // drag related variables
        this.dragok  = false;
        this.startX;
        this.startY;

        // Scene state
        this.selected = [cells ? cells[0].name : "", false];
        this.cells = cells;
        this.connecting = false;

        // Name to cell mapping for convenience and safety <3
        this.context = {};
        cells.forEach( c => { this.context[ c.name ] = c });

        this.type_map = {
            'cons': this.drawCons,
            'line': this.drawLine,
        };
    }

    setCellValue = (v) => {
        let [name, is_car] = this.selected;
        let c = this.context[name];
        console.log(c);

        if ( is_car )
            c.car = v;
        else
            c.cdr = v;

        // Redraw
        this.draw();
    }

    drawCons = (cons) => {
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(cons.x, cons.y, CELL_WIDTH, CELL_HEIGHT);

        // Write data on cell
        this.ctx.fillText(cons.car, cons.x+10, cons.y);
        this.ctx.fillText(cons.cdr, cons.x+60, cons.y);
    }

    drawLine = (l) => {
        this.ctx.beginPath();
        this.ctx.moveTo(l.x0, l.y0);
        this.ctx.lineTo(l.x1, l.y1);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    getCellAt = (mx, my) => {
        let cell = this.cells
            .filter( c => c.type == 'cons' )
            .find( c => {
                return mx > c.x && mx < c.x + CELL_WIDTH
                    && my > c.y && my < c.y + CELL_HEIGHT;
            });

        let is_car = false;
        // Either car or cdr side was clicked
        if (cell && mx < cell.x + CELL_WIDTH/2)
            is_car = true;

        return [cell, is_car];
    }

    /*
    getMousePos = () => {
        return [parseInt(e.clientX - this.offsetX),
                parseInt(e.clientY - this.offsetY)];
    }
    */

    // clear the canvas
    clear = () => {
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }

    // redraw the scene
    draw = () => {
        this.clear();

        // redraw each shape in the shapes[] array
        for ( const c of this.cells ) {
            this.type_map[ c.type ](c);
            //this.drawCons( c );
            /*
            if(shapes[i].width){
                rect(shapes[i]);
            }else{
                circle(shapes[i]);
            };
            */
        }
    }


    // handle mousedown events
    myDown = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx=parseInt(e.clientX - this.offsetX);
        var my=parseInt(e.clientY - this.offsetY);

        this.dragok = false;

        let [clicked_cell, is_car] = this.getCellAt(mx, my);

        if (clicked_cell) {
            if (this.connecting) {
                this.cells.push( newLine(mx,my,mx,my, clicked_cell.name, is_car) );
            }
            else {
                this.dragok = true;
                clicked_cell.isDragging = true;

                if (is_car)
                    this.selected = [clicked_cell.name, true];
                else
                    this.selected = [clicked_cell.name, false];
            }
        }

        /*
        for ( let i = 0; i < this.cells.length; i++ ) {
            let s = this.cells[i];
            // decide if the shape is a rect or circle
            if (mx > s.x && mx < s.x + CELL_WIDTH && my > s.y && my < s.y + CELL_HEIGHT) {
                this.dragok = true;
                s.isDragging = true;

                // Check which cell was selected
                if (mx < s.x + CELL_WIDTH/2)
                    this.selected = [i, true];
                else
                    this.selected = [i, false];
            }
        }
        */

        // save the current mouse position
        this.startX=mx;
        this.startY=my;
    }


    // handle mouseup events
    myUp = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        if (this.connecting) {
            this.connecting = false;
            let line = this.cells[ this.cells.length-1 ];

            // Current mouse position
            let mx = parseInt(e.clientX - this.offsetX);
            let my = parseInt(e.clientY - this.offsetY);

            // Get cell ended at
            let [cell, _] = this.getCellAt(mx, my);

            // Update line ending info
            line.x1 = mx;
            line.y1 = my;
            line.to = cell.name;

            // Finally update reference name in starting cell
            let from_cell = this.context[ line.from ];
            if ( line.from_is_car )
                from_cell.car = cell.name;
            else
                from_cell.cdr = cell.name;

            // Redraw
            this.draw();
        }
        else {
            // clear all the dragging flags
            this.dragok = false;

            for ( let c of this.cells )
                c.isDragging=false;
        }
    }


    // handle mouse moves
    myMove = (e) =>{
        // if we're dragging anything...
        if (this.dragok) {
            // tell the browser we're handling this mouse event
            e.preventDefault();
            e.stopPropagation();

            // get the current mouse position
            var mx=parseInt(e.clientX - this.offsetX);
            var my=parseInt(e.clientY - this.offsetY);

            // calculate the distance the mouse has moved
            // since the last mousemove
            var dx=mx - this.startX;
            var dy=my - this.startY;

            // move each rect that isDragging
            // by the distance the mouse has moved
            // since the last mousemove
            /*
            for ( const s of this.cells ) {
                if(s.isDragging){
                    s.x+=dx;
                    s.y+=dy;
                }
            }
            */
            const cell_name = this.selected[0];
            let cell = this.context[ cell_name ];
            if ( cell ) {
                cell.x += dx;
                cell.y += dy;

                // Also update any lines referencing the cell
                this.cells
                    .filter( c => c.type == 'line' )
                    .forEach( c => {
                        if ( c.from == cell_name ) {
                            c.x0 += dx;
                            c.y0 += dy;
                        }
                        else if ( c.to == cell_name ) {
                            c.x1 += dx;
                            c.y1 += dy;
                        }
                    });
            }

            // redraw the scene with the new rect positions
            this.draw();

            // reset the starting mouse position for the next mousemove
            this.startX=mx;
            this.startY=my;

        }
    }
}

// draw a single rect
/*
function rect(r) {
    ctx.fillStyle=r.fill;
    ctx.fillRect(r.x,r.y,r.width,r.height);
}
*/

// draw a single rect
/*
function circle(c) {
    ctx.fillStyle=c.fill;
    ctx.beginPath();
    ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
    ctx.closePath();
    ctx.fill();
}
*/
