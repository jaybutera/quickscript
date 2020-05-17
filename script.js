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

    addConsCell = (x, y, car="", cdr="nil") => {
        let c = newConsCell(x, y, car, cdr);

        this.cells.push(c);
        this.context[c.name] = c;

        // Redraw
        this.draw();
    };

    removeConsCell = (name) => {
        let cell = this.context[name];

        if ( cell ) {
            // Remove from context
            delete this.context[name];
            // Remove from cells list
            const i = this.cells.indexOf( cell );
            this.cells.splice(i, 1);
            // Remove associated connections
            //this.cells.filter( c => c.type == 'line' && (c.from == name || c.to == name));
            this.cells.forEach ( (c, i) => {
                if ( c.type == 'line' && (c.from == name || c.to == name) )
                    this.cells.splice(i, 1);
            });

            // Change selected to base
            this.selected = undefined;// ["", true];

            // Redraw
            this.draw();
        }
    };

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
        // Draw cell rectangle
        /*
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        */
        this.ctx.fillStyle = '#4ed39e';
        this.ctx.fillRect(cons.x, cons.y, CELL_WIDTH, CELL_HEIGHT);
        this.ctx.lineWidth = .5;
        this.ctx.strokeStyle = "#333333";
        this.ctx.strokeRect(cons.x, cons.y, CELL_WIDTH, CELL_HEIGHT);

        // Center divider line
        this.ctx.beginPath();
        this.ctx.moveTo(cons.x+CELL_WIDTH/2, cons.y);
        this.ctx.lineTo(cons.x+CELL_WIDTH/2, cons.y+CELL_HEIGHT);
        this.ctx.stroke();

        // Write data on cell
        const offset = 6;
        this.ctx.fillStyle = '#272727';
        this.ctx.font = '18px Helvetica';
        /*
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = "#999999";
        */
        this.ctx.fillText(cons.car, cons.x+offset, cons.y+CELL_HEIGHT-offset);
        this.ctx.fillText(cons.cdr, cons.x+(CELL_WIDTH/2)+offset, cons.y+CELL_HEIGHT-offset);
    }

    drawLine = (l) => {
        this.ctx.strokeStyle = '#111111';
        this.ctx.beginPath();
        this.ctx.moveTo(l.x0, l.y0);
        this.ctx.lineTo(l.x1, l.y1);
        this.ctx.stroke();
    }

    drawSelected = () => {
        if ( !this.selected ) return

        const cell = this.context[ this.selected[0] ];
        const is_car = this.selected[1];

        this.ctx.fillStyle = '#5df4cc';
        if ( cell && is_car )
            this.ctx.fillRect(cell.x, cell.y, CELL_WIDTH/2, CELL_HEIGHT);
        else
            this.ctx.fillRect(cell.x+CELL_WIDTH/2, cell.y, CELL_WIDTH/2, CELL_HEIGHT);

        let offset = 6;
        this.ctx.fillStyle = '#272727';
        this.ctx.fillText(cell.car, cell.x+offset, cell.y+CELL_HEIGHT-offset);
        this.ctx.fillText(cell.cdr, cell.x+(CELL_WIDTH/2)+offset, cell.y+CELL_HEIGHT-offset);

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeRect(cell.x, cell.y, CELL_WIDTH, CELL_HEIGHT);
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
        this.cells
            .filter( e => e.type == 'line')
            .forEach( c => this.drawLine(c) );
        this.cells
            .filter( e => e.type == 'cons')
            .forEach( c => this.drawCons(c) );
        this.drawSelected();
        /*
        for ( const c of this.cells )
            this.type_map[ c.type ](c);
        */
    }

    mouseDownEvent = (e) => {
        document.getElementById('debug').innerText = "mouse down";
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // Current mouse position
        let mx = parseInt(e.clientX - this.offsetX);
        let my = parseInt(e.clientY - this.offsetY);

        this.handleDownEvent(mx, my);
    }

    touchDownEvent = (e) => {
        document.getElementById('debug').innerText = "touch down";

        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        this.handleDownEvent(touch.pageX, touch.pageY);
    }

    // handle mousedown events
    handleDownEvent = (x, y) => {
        this.dragok = false;

        let [clicked_cell, is_car] = this.getCellAt(x, y);

        if (clicked_cell) {
            if (this.connecting) {
                this.cells.push( newLine(x,y,x,y, clicked_cell.name, is_car) );
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

        this.draw();

        // save the current mouse position
        this.startX=x;
        this.startY=y;
    }

    mouseUpEvent = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // Current mouse position
        let mx = parseInt(e.clientX - this.offsetX);
        let my = parseInt(e.clientY - this.offsetY);

        this.handleUpEvent(mx, my);
    }

    touchUpEvent = (e) => {
        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        this.handleUpEvent(touch.pageX, touch.pageY);
    }

    // handle mouseup events
    handleUpEvent = (x, y) => {
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
                else if ( line.from_is_car )
                    from_cell.car = cell.name;
                else
                    from_cell.cdr = cell.name;

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
    mouseMoveEvent = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        let mx = parseInt(e.clientX - this.offsetX);
        let my = parseInt(e.clientY - this.offsetY);

        this.handleMoveEvent(mx, my);
    }

    // Handle touch move event
    touchMoveEvent = (e) => {
        // tell the browser we're handling this touch event
        e.preventDefault();
        e.stopPropagation();

        // Just take the first, no multitouch here
        let touch = e.changedTouches[0];

        this.handleMoveEvent(touch.pageX, touch.pageY);
    }

    // Generic mouse handler for both mouse and touch
    // Just takes a new position
    handleMoveEvent = (x,y) => {
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
