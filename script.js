const CELL_WIDTH = 50;
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
function newList (x, y, elems=['nil'], name=genConsName()) {
    return {
        type: 'list',
        name: name,
        x: x,
        y: y,
        elems: elems,
        isDragging: false,
    }
}

function newLine (x0,y0,x1,y1, from="", from_index=0, to="") {
    return {
        type: 'line',
        from: from, // name of object the line starts from
        to: to,
        from_index: from_index,
        //from_is_car: from_is_car,
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
    }
}

function fromAST (expr) {
    if ( expr instanceof Array ) {
        // Push the current expr
        let l = [ newList(10,10,expr) ];

        // Push sub-exprs
        l.concat(
            expr.filter( e => { return e instanceof Array })
                .map( e => { return fromAST(e) })
        );
        // Generate lines from cells
        const lines = l.map( v => { return newLine(
            l[0].x, l[0].y,
            v.x, v.y,
            l[0].name, l. v.name)
        });

        return [l, lines];
    }

    // Only care about cells
    else return null
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
        this.selected = cells.length < 1 ? cells[0].name : null;
        this.cells = cells;
        this.connecting = false;

        // Name to cell mapping for convenience and safety <3
        this.context = {};
        cells.forEach( c => { this.context[ c.name ] = c });

        /*
        this.type_map = {
            'cons': this.drawCons,
            'line': this.drawLine,
            'list': this.drawList,
        };
        */
    }

    addList (x, y, elems=['nil']) {
        let c = newList(x, y, elems);

        this.cells.push(c);
        this.context[c.name] = c;

        // Redraw
        this.draw();
    }

    removeCell (name) {
        let cell = this.context[name];

        if ( cell ) {
            // Remove from context
            delete this.context[name];
            // Remove from cells list
            const i = this.cells.indexOf( cell );
            this.cells.splice(i, 1);
            // Remove associated connections
            for ( let i = this.cells.length-1; i >= 0; i--) {
                let c = this.cells[i];

                if ( c.type == 'line' && (c.from == name || c.to == name) )
                    this.cells.splice(i, 1);
            }

            // Change selected to base
            this.selected = undefined;

            // Redraw
            this.draw();
        }
    }

    setCellValue (v) {
        let [name, index] = this.selected;
        let c = this.context[name];
        console.log(c);

        c.elems[index] = v;

        // Redraw
        this.draw();
    }

    drawList (cell) {
        const rect_len = CELL_WIDTH * cell.elems.length;

        // Draw rectangle
        this.ctx.fillStyle = '#4ed39e';
        this.ctx.fillRect(cell.x, cell.y, rect_len, CELL_HEIGHT);
        this.ctx.lineWidth = .5;
        this.ctx.strokeStyle = "#333333";
        this.ctx.strokeRect(cell.x, cell.y, rect_len, CELL_HEIGHT);

        for ( let i = 0; i < cell.elems.length; i++) {
            const x_offset = CELL_WIDTH * i;
            // Divider line
            this.ctx.beginPath();
            this.ctx.moveTo(cell.x + x_offset, cell.y);
            this.ctx.lineTo(cell.x + x_offset, cell.y+CELL_HEIGHT);
            this.ctx.stroke();

            // Write data on cell
            const offset = 6;
            this.ctx.fillStyle = '#272727';
            this.ctx.font = '18px Helvetica';
            this.ctx.fillText(cell.elems[i],
                cell.x + offset + x_offset,
                cell.y+CELL_HEIGHT-offset,
                CELL_WIDTH-offset);
        }
    }

    drawLine (l) {
        this.ctx.strokeStyle = '#111111';
        this.ctx.beginPath();
        this.ctx.moveTo(l.x0, l.y0);
        this.ctx.lineTo(l.x1, l.y1);
        this.ctx.stroke();
    }

    drawSelected () {
        if ( !this.selected ) return;

        const cell = this.context[ this.selected[0] ];
        //const is_car = this.selected[1];
        const index = this.selected[1];

        // Highlight specific cell
        const cx = CELL_WIDTH * index;
        this.ctx.fillStyle = '#5df4cc';
        this.ctx.fillRect(cell.x + cx, cell.y, CELL_WIDTH, CELL_HEIGHT);

        // Rewrite text
        let offset = 6;
        this.ctx.fillStyle = '#272727';
        for ( let i = 0; i < cell.elems.length; i++)
            this.ctx.fillText(cell.elems[i],
                cell.x + offset + CELL_WIDTH*i,
                cell.y+CELL_HEIGHT-offset,
                CELL_WIDTH-offset);

        // Border whole box
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeRect(cell.x, cell.y, CELL_WIDTH * cell.elems.length, CELL_HEIGHT);
    }

    getCellAt (mx, my) {
        let cell = this.cells
            .filter( c => c.type == 'list' )
            .find( c => {
                return mx > c.x && mx < c.x + (CELL_WIDTH * c.elems.length)
                    && my > c.y && my < c.y + CELL_HEIGHT;
            });

        let cell_num = 0;
        if ( cell )
            cell_num = Math.floor( (mx - cell.x) / CELL_WIDTH );

        return [cell, cell_num];
    }

    // clear the canvas
    clear () {
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }

    // redraw the scene
    draw () {
        this.clear();

        // redraw each shape in the shapes[] array
        this.cells
            .filter( e => e.type == 'line')
            .forEach( c => this.drawLine(c) );
        this.cells
            .filter( e => e.type == 'list')
            .forEach( c => this.drawList(c) );
        this.drawSelected();
        //for ( const c of this.cells )
        //    this.type_map[ c.type ](c);
    }

    thisFn () {
        return this;
    }

    mouseDownEvent (e) {
        //document.getElementById('debug').innerText = "mouse down";
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // Current mouse position
        let mx = parseInt(e.clientX - e.target.offsetLeft);
        let my = parseInt(e.clientY - e.target.offsetTop);

        this.handleDownEvent(mx, my);
    }

    touchDownEvent (e) {
        //document.getElementById('debug').innerText = "touch down";

        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        //if ( e.target.className == 
        //this.handleDownEvent(touch.pageX, touch.pageY);
        this.handleDownEvent(
            touch.pageX - this.offsetX,
            touch.pageY - this.offsetY);
    }

    // handle mousedown events
    handleDownEvent (x, y) {
        this.dragok = false;

        let [clicked_cell, index] = this.getCellAt(x, y);

        if (clicked_cell) {
            if (this.connecting) {
                this.cells.push( newLine(x,y,x,y, clicked_cell.name, index) );
            }
            else {
                this.dragok = true;
                clicked_cell.isDragging = true;

                this.selected = [clicked_cell.name, index];

                // Update text input to match
                const sel = this.selected;
                document.getElementById('var-name').value =
                    this.context[ sel[0] ].elems[ sel[1] ];
            }
        }

        this.draw();

        // save the current mouse position
        this.startX=x;
        this.startY=y;
    }

    mouseUpEvent (e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // Current mouse position
        let mx = parseInt(e.clientX - this.offsetX);
        let my = parseInt(e.clientY - this.offsetY);

        this.handleUpEvent(mx, my);
    }

    touchUpEvent (e) {
        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        //this.handleUpEvent(touch.pageX, touch.pageY);
        //this.handleDownEvent(touch.clientX - e.target.offsetLeft, touch.clientY - e.target.offsetTop);
        this.handleUpEvent(
            touch.pageX - this.offsetX,
            touch.pageY - this.offsetY);
    }

    // handle mouseup events
    handleUpEvent (x, y) {
        if (this.connecting) {
            this.connecting = false;
            let line = this.cells[ this.cells.length-1 ];

            // Get cell ended at
            let [cell, _] = this.getCellAt(x, y);

            if ( cell ) {
                // Update line ending info
                line.x1 = x;
                line.y1 = y;
                line.to = cell.name;

                // Finally update reference name in starting cell
                let from_cell = this.context[ line.from ];
                if ( line.from == '' )
                    this.cells.pop();
                else
                    from_cell.elems[ line.from_index ] = cell.name;

                // Redraw
                this.draw();
            }
            else {
                // Didn't end at a cell
                // Remove the line started by the down click
                this.cells.pop();
            }
        }
        else {
            // clear all the dragging flags
            this.dragok = false;
        }
    }


    // handle mouse moves
    mouseMoveEvent (e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        let mx = parseInt(e.clientX - this.offsetX);
        let my = parseInt(e.clientY - this.offsetY);

        this.handleMoveEvent(mx, my);
    }

    // Handle touch move event
    touchMoveEvent (e) {
        //document.getElementById('debug').innerText = "touch move";
        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        //this.handleMoveEvent(touch.pageX, touch.pageY);
        //this.handleDownEvent(touch.clientX - e.target.offsetLeft, touch.clientY - e.target.offsetTop);
        this.handleMoveEvent(
            touch.pageX - this.offsetX,
            touch.pageY - this.offsetY);
    }

    // Generic mouse handler for both mouse and touch
    // Just takes a new position
    handleMoveEvent (x,y) {
        // if we're dragging anything...
        if (this.dragok) {
            // calculate distance since the last move
            let dx = x - this.startX;
            let dy = y - this.startY;

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
            this.startX=x;
            this.startY=y;

        }
    }
}
