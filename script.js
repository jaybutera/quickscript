const CELL_WIDTH = 100;
const CELL_HEIGHT = 30;

// An algorithmic global name generator
// TODO: Change this to a hash of the object being named
var name_counter = 0;
function genName() {
    let n = 'x' + name_counter;
    name_counter += 1;
    return n;
}

// If no name is given, algorithmically assign one
function newConsCell (x, y, car="", cdr="nil", name=genName()) {
    return {
        name: name,
        car: car,
        cdr: cdr,
        x: x,
        y: y,
        isDragging: false,
    }
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
        this.selected = [0, false];
        this.cells = cells;
        console.log(this.cells)
    }

    setCellValue = (v) => {
        let [i,is_car] = this.selected;
        console.log(this.cells[i]);

        if ( is_car )
            this.cells[i].car = v;
        else
            this.cells[i].cdr = v;

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

    line = (l) => {
        this.ctx.beginPath();
        this.ctx.moveTo(l.x0, l.y0);
        this.ctx.lineTo(l.x1, l.y1);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    // clear the canvas
    clear = () => {
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }

    // redraw the scene
    draw = () => {
        this.clear();

        // redraw each shape in the shapes[] array
        for ( const c of this.cells ) {
            this.drawCons( c );
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

        // test each shape to see if mouse is inside
        this.dragok=false;
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
            /*
            if(s.width){
                // test if the mouse is inside this rect
                if(mx>s.x && mx<s.x+s.width && my>s.y && my<s.y+s.height){
                    // if yes, set that rects isDragging=true
                    this.dragok=true;
                    s.isDragging=true;
                }
            }else{
                var dx=s.x-mx;
                var dy=s.y-my;
                // test if the mouse is inside this circle
                if(dx*dx+dy*dy<s.r*s.r){
                    this.dragok=true;
                    s.isDragging=true;
                }
            }
            */
        }

        // save the current mouse position
        this.startX=mx;
        this.startY=my;
    }


    // handle mouseup events
    myUp = (e) => {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // clear all the dragging flags
        this.dragok = false;

        for ( const c of this.cells )
            c.isDragging=false;
    }


    // handle mouse moves
    myMove = (e) =>{
        // if we're dragging anything...
        if (this.dragok){

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
            for ( const s of this.cells ) {
                if(s.isDragging){
                    s.x+=dx;
                    s.y+=dy;
                }
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
