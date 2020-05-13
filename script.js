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
function newConsCell (x, y, car="", cdr="nil", name=newName()) {
    return {
        name: name,
        car: car,
        cdr: cdr,
        x: x,
        y: y,
    }
}

class Scene {
    constructor(canvas, ctx) {
        this.ctx = ctx;
        this.BB  = canvas.getBoundingClientRect();
        this.offsetX = this.BB.left;
        this.offsetY = this.BB.top;
        console.log(this.offsetY);
        this.WIDTH   = canvas.width;
        this.HEIGHT  = canvas.height;

        // drag related variables
        this.dragok  = false;
        this.startX;
        this.startY;
    }

    drawCons(cons) {
        ctx.fillStyle = 'green';
        ctx.fillRect(cons.x, cons.y, CELL_WIDTH, CELL_HEIGHT);

        // Write data on cell
        ctx.fillText(cons.car, cons.x+10, cons.y);
        ctx.fillText(cons.cdr, cons.x+60, cons.y);
    };

    line(l) {
        ctx.beginPath();
        ctx.moveTo(l.x0, l.y0);
        ctx.lineTo(l.x1, l.y1);
        ctx.closePath();
        ctx.stroke();
    };

    // clear the canvas
    clear() {
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    }

    // redraw the scene
    draw() {
        this.clear();

        // redraw each shape in the shapes[] array
        for(var i=0;i<shapes.length;i++){
            // decide if the shape is a rect or circle
            // (it's a rect if it has a width property)
            this.drawCons( shapes[i] );
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
    myDown(e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx=parseInt(e.clientX - this.offsetX);
        var my=parseInt(e.clientY - this.offsetY);

        // test each shape to see if mouse is inside
        this.dragok=false;
        for(var i=0;i<shapes.length;i++){
            var s=shapes[i];
            // decide if the shape is a rect or circle
            console.log("checking (" + mx + "," + my + ")");
            if (mx > s.x && mx < s.x + CELL_WIDTH && my > s.y && my < s.y + CELL_HEIGHT) {
                console.log("yup!");
                this.dragok = true;
                s.isDragging = true;
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
    myUp(e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // clear all the dragging flags
        this.dragok = false;
        for(var i=0;i<shapes.length;i++){
            shapes[i].isDragging=false;
        }
    }


    // handle mouse moves
    myMove(e) {
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
            for(var i=0;i<shapes.length;i++){
                var s=shapes[i];
                if(s.isDragging){
                    s.x+=dx;
                    s.y+=dy;
                }
            }

            // redraw the scene with the new rect positions
            draw();

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
