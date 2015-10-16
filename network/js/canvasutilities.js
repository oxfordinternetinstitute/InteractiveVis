'use strict';
// Copyright Patrick Horgan patrick at dbp-consulting dot com
// Permission to use granted as long as you keep this notice intact
// use strict is everywhere because some browsers still don't support
// using it once for the whole file and need per method/function
// use.
// Part is derivitive of work by Juan Mendes as noted below as appropriate.
// Some things depend on code in http://dbp-consulting/scripts/utilities.js

CanvasRenderingContext2D.prototype.roundedRect = 
		function(x, y, width, height, radius, fill, stroke) {
    // This was originally written by Juan Mendes and I have
    // modified it a tiny bit here and there, i.e. added the
    // ctx.save and ctx.restore, so that it can be called without
    // regard to side-effects, and moved the stroke after the fill,
    // because otherwise the fill messes up the stroke which follows the
    // edge with half its width inside the rectangle and half its width
    // outside the rectangle.  The part inside the rectangle is overdrawn
    // with the fill if it comes first.
    // Check out his blog at http://js-bits.blogspot.com
    // The tl (top left), tr (top right), br (bottom right), bl (bottom left)
    // are unnamed optional arguments.
    //     false or unset - rounded corner
    //     true           - square corner
    'use strict';
    var tl=arguments[7];
    var tr=arguments[8];
    var br=arguments[9];
    var bl=arguments[10];

    // default stroke and radius but not fill since its default
    // is false, and undefined tests as false anyway.

    if (typeof stroke == "undefined" ) { stroke = true; } 
    if (typeof radius === "undefined") { radius = 5; }

    this.save()
    //do the line for the top
    this.beginPath();
    this.moveTo(x+radius,y);
    this.lineTo(x+width-radius,y);
    //now the top right corner
    if(!tr){
	this.quadraticCurveTo(x+width,y,x+width,y+radius);
    }else{
	this.lineTo(x+width,y);
	this.lineTo(x+width,y+radius);
    }
    //now right right side
    this.lineTo(x+width,y+height-radius);
    //now the bottom left corner
    if(!br){
	this.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
    }else{
	this.lineTo(x+width,y+height);
	this.lineTo(x+width-radius,y+height);
    }
    //now the bottom line
    this.lineTo(x+radius,y+height);
    // now the bottom left corner
    if(!bl){
	this.quadraticCurveTo(x,y+height,x,y+height-radius);
    }else{
	this.lineTo(x,y+height);
	this.lineTo(x,y+height-radius);
    }
    //left side line
    this.lineTo(x,y+radius);
    //top left corner
    if(!tl){
	this.quadraticCurveTo(x,y,x+radius,y);
    }else{
	this.lineTo(x,y);
	this.lineTo(x+radius,y);
    }
    // shouldn't need to close it, we just did, but defensively...
    this.closePath();

    // fill it if they asked
    if (fill) { this.fill(); }        

    //then draw a stroke around the path
    if (stroke) { this.stroke(); }

    //put everything back like we found it.
    this.restore();
}

var drawLineAngle=function(ctx,x0,y0,angle,length)
{
    ctx.save();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x0+length*Math.cos(angle),y0+length*Math.sin(angle));
    ctx.stroke();
    ctx.restore();
}
      
var drawHead=function(ctx,x0,y0,x1,y1,x2,y2,style)
{
  'use strict';
  if(typeof(x0)=='string') x0=parseInt(x0,10);
  if(typeof(y0)=='string') y0=parseInt(y0,10);
  if(typeof(x1)=='string') x1=parseInt(x1,10);
  if(typeof(y1)=='string') y1=parseInt(y1,10);
  if(typeof(x2)=='string') x2=parseInt(x2,10);
  if(typeof(y2)=='string') y2=parseInt(y2,10);
  var radius=3;
  var twoPI=2*Math.PI;
  // all cases do this.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x2,y2);
  switch(style){
    case 0:
      // curved filled, add the bottom as an arcTo curve and fill
      var backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
      ctx.arcTo(x1,y1,x0,y0,.55*backdist);
      ctx.fill();
      break;
    case 1:
      // straight filled, add the bottom as a line and fill.
      ctx.beginPath();
      ctx.moveTo(x0,y0);
      ctx.lineTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineTo(x0,y0);
      ctx.fill();
      break;
    case 2:
      // unfilled head, just stroke.
      ctx.stroke();
      break;
    case 3:
      //filled head, add the bottom as a quadraticCurveTo curve and fill
      var cpx=(x0+x1+x2)/3;
      var cpy=(y0+y1+y2)/3;
      ctx.quadraticCurveTo(cpx,cpy,x0,y0);
      ctx.fill();
      break;
    case 4:
      //filled head, add the bottom as a bezierCurveTo curve and fill
      var cp1x, cp1y, cp2x, cp2y,backdist;
      var shiftamt=5;
      if(x2==x0){
	// Avoid a divide by zero if x2==x0
	backdist=y2-y0;
	cp1x=(x1+x0)/2;
	cp2x=(x1+x0)/2;
	cp1y=y1+backdist/shiftamt;
	cp2y=y1-backdist/shiftamt;
      }else{
	backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
	var xback=(x0+x2)/2;
	var yback=(y0+y2)/2;
	var xmid=(xback+x1)/2;
	var ymid=(yback+y1)/2;

	var m=(y2-y0)/(x2-x0);
	var dx=(backdist/(2*Math.sqrt(m*m+1)))/shiftamt;
	var dy=m*dx;
	cp1x=xmid-dx;
	cp1y=ymid-dy;
	cp2x=xmid+dx;
	cp2y=ymid+dy;
      }

      ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x0,y0);
      ctx.fill();
      break;
  }
  ctx.restore();
};

var drawArcedArrow=function(ctx,x,y,r,startangle,endangle,anticlockwise,style,which,angle,d)
{
    'use strict';
    style=typeof(style)!='undefined'? style:3;
    which=typeof(which)!='undefined'? which:1; // end point gets arrow
    angle=typeof(angle)!='undefined'? angle:Math.PI/8;
    d    =typeof(d)    !='undefined'? d    :10;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y,r,startangle,endangle,anticlockwise);
    ctx.stroke();
    var sx,sy,lineangle,destx,desty;
    ctx.strokeStyle='rgba(0,0,0,0)';	// don't show the shaft
    if(which&1){	    // draw the destination end
	sx=Math.cos(startangle)*r+x;
	sy=Math.sin(startangle)*r+y;
	lineangle=Math.atan2(x-sx,sy-y);
	if(anticlockwise){
	    destx=sx+10*Math.cos(lineangle);
	    desty=sy+10*Math.sin(lineangle);
	}else{
	    destx=sx-10*Math.cos(lineangle);
	    desty=sy-10*Math.sin(lineangle);
	}
	drawArrow(ctx,sx,sy,destx,desty,style,2,angle,d);
    }
    if(which&2){	    // draw the origination end
	sx=Math.cos(endangle)*r+x;
	sy=Math.sin(endangle)*r+y;
	lineangle=Math.atan2(x-sx,sy-y);
	if(anticlockwise){
	    destx=sx-10*Math.cos(lineangle);
	    desty=sy-10*Math.sin(lineangle);
	}else{
	    destx=sx+10*Math.cos(lineangle);
	    desty=sy+10*Math.sin(lineangle);
	}
	drawArrow(ctx,sx,sy,destx,desty,style,2,angle,d);
    }
    ctx.restore();
}

var drawArrow=function(ctx,x1,y1,x2,y2,style,which,angle,d)
{
  'use strict';
  // Ceason pointed to a problem when x1 or y1 were a string, and concatenation
  // would happen instead of addition
  if(typeof(x1)=='string') x1=parseInt(x1,10);
  if(typeof(y1)=='string') y1=parseInt(y1,10);
  if(typeof(x2)=='string') x2=parseInt(x2,10);
  if(typeof(y2)=='string') y2=parseInt(y2,10);
  style=typeof(style)!='undefined'? style:3;
  which=typeof(which)!='undefined'? which:1; // end point gets arrow
  angle=typeof(angle)!='undefined'? angle:Math.PI/8;
  d    =typeof(d)    !='undefined'? d    :10;
  // default to using drawHead to draw the head, but if the style
  // argument is a function, use it instead
  var toDrawHead=typeof(style)!='function'?drawHead:style;

  // For ends with arrow we actually want to stop before we get to the arrow
  // so that wide lines won't put a flat end on the arrow.
  //
  var dist=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var ratio=(dist-d/3)/dist;
  var tox, toy,fromx,fromy;
  if(which&1){
    tox=Math.round(x1+(x2-x1)*ratio);
    toy=Math.round(y1+(y2-y1)*ratio);
  }else{
    tox=x2;
    toy=y2;
  }
  if(which&2){
    fromx=x1+(x2-x1)*(1-ratio);
    fromy=y1+(y2-y1)*(1-ratio);
  }else{
    fromx=x1;
    fromy=y1;
  }
  
  // Draw the shaft of the arrow
  ctx.beginPath();
  ctx.moveTo(fromx,fromy);
  ctx.lineTo(tox,toy);
  ctx.stroke();

  // calculate the angle of the line
  var lineangle=Math.atan2(y2-y1,x2-x1);
  //console.log(lineangle);
  // h is the line length of a side of the arrow head
  var h=Math.abs(d/Math.cos(angle));

  if(which&1){	// handle far end arrow head
    var angle1=lineangle+Math.PI+angle;
    var topx=x2+Math.cos(angle1)*h;
    var topy=y2+Math.sin(angle1)*h;
    var angle2=lineangle+Math.PI-angle;
    var botx=x2+Math.cos(angle2)*h;
    var boty=y2+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x2,y2,botx,boty,style);
  }
  if(which&2){ // handle near end arrow head
    var angle1=lineangle+angle;
    var topx=x1+Math.cos(angle1)*h;
    var topy=y1+Math.sin(angle1)*h;
    var angle2=lineangle-angle;
    var botx=x1+Math.cos(angle2)*h;
    var boty=y1+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x1,y1,botx,boty,style);
  }
}


// boundingBox keeps track of the top left and bottom right coordinates of rect
// x, y - coordinate of top left corner
// xextent - width
// yextent - height
function boundingBox(x,y,xextent,yextent)
{
    'use strict';
    this.x1=x;
    this.y1=y;
    this.x2=x+xextent;
    this.y2=y+yextent;
    this.toString=function(){ return 'boundingBox(('+this.x1+','+this.y1+'),('+this.x2+','+this.y2+'))'; }
}

// makes a valiant effort to change an x,y pair from an event to an array of
// size two containing the resultant x,y offset onto the canvas.
// There are events, like key events for which this will not work.  They
// are not mouse events and don't have the x,y coordinates.
function getCanvasCursorPosition(e,canvas)
{
    'use strict';
    var x;
    var y;
    if(e.type=='touchmove'||e.type=='touchstart'||e.type=='touchend'){
	x = e.touches[0].pageX;
	y = e.touches[0].pageY;
    }else if (e.pageX || e.pageY) {
	x = e.pageX;
	y = e.pageY;
    } else {
	x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    // Convert to coordinates relative to the canvas
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return [x,y]
}

// handy constants
var SLIDER_HORIZONTAL=0;
var SLIDER_VERTICAL=1;
var CVS_BUTTON_DOWN=0;
var CVS_BUTTON_UP=1;
var CVS_BUTTON_NORMAL=0;
var CVS_BUTTON_TOGGLE=1;
var CVS_BUTTON_LEFT_ARROW=2;
var CVS_BUTTON_RIGHT_ARROW=3;

function button(ctx,x,y,width,height,eventmanager,onchange,name,type,state,color)
{
    'use strict';
    var self=this;
    this.eventmanager=eventmanager; // this is the guy that sends us events
    this.ctx=ctx;   // we use this to draw ourselves on the canvas
    this.x=x;	    // top left x,y
    this.y=y;
    this.height=height;
    this.width=width;
    this.onchange=onchange; // Call this when we change
    this.name=name;	    // for debugging
    this.state=typeof(state)!='undefined'?state?CVS_BUTTON_DOWN:CVS_BUTTON_UP:CVS_BUTTON_UP;
    this.type=typeof(type)!='undefined'? type:CVS_BUTTON_NORMAL;
    this.toggle=this.type==CVS_BUTTON_TOGGLE?true:false;
    this.color=typeof(color)!='undefined'?color:'rgba(205,205,205,1)';
    var clrObj=new colorObject(this.color);

    // This is the eventhandler for the button
    // it returns true if we don't consume the event, else
    // returns cancelEvent(e) (which returns false)
    // x,y - canvas relative x and y
    // e - the actual event
    this.getstate=function()
    {
	return self.state;
    }

    this.setstate=function(state)
    {
	var old_state=self.state;
	self.state=typeof(state)!='undefined'?state?CVS_BUTTON_DOWN:CVS_BUTTON_UP:CVS_BUTTON_UP;
	if(old_state!=self.state){
	    self.onchange();
	}
    }

    this.eventhandler=function(x,y,e)
    {
	// at the end if state is still old_state, then we didn't react to the
	// event noticably, so we won't call the onChange handler
	'use strict';
	var old_state=self.state;

	if(e.type=='keydown'){
	    if(e.keyCode==13){
		// <ENTER> key
		if(!self.keyupID){
		    self.keyupID=self.eventmanager.listen('keyup',self.hit,self.eventhandler);
		}
		if(self.toggle){
		    self.state= self.state==CVS_BUTTON_DOWN?
						CVS_BUTTON_UP:CVS_BUTTON_DOWN;
		}else{
		    self.state=CVS_BUTTON_DOWN;
		}
	    }else{
		return true;
	    }
	}else if(e.type=='keyup'){
	    if(e.keyCode==13){
		self.eventmanager.quitlistening('keyup',self.keyupID);
		if(!self.toggle){
		    self.state=CVS_BUTTON_UP;
		}
	    }
	}else if(e.type=='mousedown'){
	    if(self.toggle){
		self.state= self.state==CVS_BUTTON_DOWN?
					    CVS_BUTTON_UP:CVS_BUTTON_DOWN;
	    }else{
		self.state=CVS_BUTTON_DOWN;
	    }
	    // turn on listening to mouseup, mouseclick, mouseout
	    if(!self.mouseupID && !self.toggle){
		self.mouseupID=self.eventmanager.listen('mouseup',self.hit,self.eventhandler);
	    }
	    if(!self.mouseclickID && !self.toggle){
		self.mouseclickID=self.eventmanager.listen('mouseclick',self.hit,self.eventhandler);
	    }
	    if(!self.mouseoutID && !self.toggle){
		// we need to know when the mouse leaves so we can stop 
		// listening for stuff
		self.mouseoutID=self.eventmanager.listen('mouseout',self.hit,self.eventhandler);
	    }
	}else if(e.type == 'mouseup' ||
		  e.type == 'mouseclick' ||
		  e.type == 'mouseout'){
	    if(!self.toggle){
		self.state=CVS_BUTTON_UP;
	    }
	    // any one of these is good for a mouse up, turn them off until
	    // we get another mousedown
	    if(self.mouseupID){
		self.eventmanager.quitlistening('mouseup',self.mouseupID);
		self.mouseupID=null;
	    }
	    if(self.mouseclickID){
		self.eventmanager.quitlistening('mouseclick',self.mouseclickID);
		self.mouseclickID=null;
	    }
	    if(self.mouseoutID){
		self.eventmanager.quitlistening('mouseout',self.mouseoutID);
		self.mouseoutID=null;
	    }
	}
	if(self.state!=old_state){
	    // Only if it changed our state did we really consume it.
	    // call the callback and cancel the event and return
	    self.onchange();
	    return cancelEvent(e);
	}else{
	  // nothing changed, so return true so that someone else gets event
	  return true;
	}
    }

    // This draws our pretty button self.
    this.draw=function()
    {
	'use strict';
	self.ctx.save();    // Make us reentrant
	self.ctx.strokeStyle='rgb(0,0,0)';
	self.ctx.lineWidth=1;

	if(self.type==CVS_BUTTON_NORMAL){
	  // draw a black surrounding line.  Offset by one for 3d
	  ctx.roundedRect(self.x,self.y,self.width-1,self.height-1,2,false,true);
	  self.ctx.strokeStyle='rgb(255,255,255)';
	  // offset by one the other way for 3d effect
	  ctx.roundedRect(self.x+1,self.y+1,self.width,self.height,2,false,true);
	  if(self.state==CVS_BUTTON_DOWN){
	    self.ctx.fillStyle=clrObj.mult(.75);
	    ctx.roundedRect(self.x+1,self.y+1,self.width-3,self.height-3,2,true,false);
	    var grad=ctx.createLinearGradient(self.x+1,self.y+1,self.x+1,self.height-3+self.y);
	    grad.addColorStop(0,'rgba(180,180,180,.6)');
	    grad.addColorStop(.3,'rgba(245,245,245,1.0)');
	    grad.addColorStop(1,'rgba(0,0,0,.5)');
	    ctx.fillStyle=grad;
	    ctx.roundedRect(self.x+1,self.y+1,self.width-3,self.height-3,2,true,false);

	  }else if(self.state==CVS_BUTTON_UP){
	    self.ctx.fillStyle=clrObj.mult(.92);
	    ctx.roundedRect(self.x+2,self.y+2,self.width-4,self.height-4,2,true,false);
	    var grad=ctx.createLinearGradient(self.x+2,self.y+2,self.x+2,self.height+self.y);
	    grad.addColorStop(0,'rgba(255,255,255,1)');
	    grad.addColorStop(1,'rgba(245,245,245,0.0)');
	    ctx.fillStyle=grad;
	    ctx.roundedRect(self.x+2,self.y+2,self.width-4,self.height-4,2,true,false);
	  }
	} else if(self.toggle){
	    ctx.clearRect(self.x,self.y,self.x,self.y);
	    ctx.beginPath();
	    ctx.arc(self.x+.25*self.width,self.y+.5*self.height,7,0,Math.PI*2,false);
	    ctx.strokeStyle='rgb(0,0,0)';
	    ctx.stroke();
	    if(self.state==CVS_BUTTON_DOWN){
		if(self.toggle){
		    ctx.beginPath();
		    ctx.fillStyle='rgb(0,0,0)';
		    ctx.arc(self.x+.25*self.width,self.y+.5*self.height,2,0,Math.PI*2,false);
		    ctx.fill();
		}
	    }
	}
	
	if(self.name){
	    self.ctx.fillStyle='rgb(0,0,0)';
	    var txtwidth=self.ctx.measureText(self.name).width;
	    var y=self.toggle||self.state==CVS_BUTTON_UP?self.y+self.height/2:self.y+self.height/2+1;
	    var x=self.toggle?self.x+.25*self.width+20:self.x+self.width/2-txtwidth/2;
	    ctx.textBaseline='middle';
	    self.ctx.fillText(self.name,x,y);
	}
	self.ctx.restore();
    }

    // an easy way to keep track of us on screen.
    this.bb=new boundingBox(this.x,this.y,this.width,this.height);

    // called from event manager to ask us if an x,y pair is us.  Return true
    // to get whatever event it is.
    this.hit=function(x,y,e){
	'use strict';

	if(x>=self.bb.x1 && x<=self.bb.x2 && y>=self.bb.y1 && y<=self.bb.y2){
	    return true;
	}else{
	    return false;
	}
    }

    // These are the initial events we listen on always
    this.keydown=
	this.eventmanager.listen('keydown',this.hit,self.eventhandler);
    // We'll quit mouse events if we get touch events
    this.mousedownID=
	this.eventmanager.listen('mousedown',this.hit,self.eventhandler);
    this.mouseupID=null;
    this.keyupID=null;
    this.mouseclickID=null;
}

// a class to encapsulate the workings of a slider to be drawn on a canvas
// ctx - canvas context, (assumes 2d), used in draw method
// x,y - canvas relative location of top left
// length - the long measurment, this could be along x or y axis depending 
//	    on whether orientation is horizontal or vertical
// width  - the short measurement
// orientation - one of SLIDER_HORIZONTAL or SLIDER_VERTICAL
// min - the minimum value returned by the slider
// max - the maximum value returned by the slider
// step - how far on click changes value of slider
// value - original value of slider at creation
// eventmanager - who we talk to say that we want to start or stop listening
//	    for particular events
// onchange - a routine we call we our value changes
// name - our name - useful for debugging
function slider(ctx,x, y, length, width, orientation, min, max, step, value,eventmanager,onchange,name)
{
    'use strict';
    var self=this;
    this.eventmanager=eventmanager; // this is the guy that sends us events
    this.ctx=ctx;   // we use this to draw ourselves on the canvas
    this.x=x;	    // top left x,y
    this.y=y;
    this.length=length;	// long way
    this.width=width;	// short way
    this.orientation=orientation;   //vertical or horizontal
    if(min<=max){ this.min=min; this.max=max; }
    else{ this.min=max; this.max=min; }
    this.range=this.max-this.min;
    this.step=step;

    // make sure the value is an even step amount
    var checkValue=function(inval,min,max,step){
	'use strict';
	var val=Math.round(inval);
	val=val-(val % step);
	if(val<min){
	    val=min;
	}else if(val>max){
	    val=max;
	}
	return val;
    }
    this.value=checkValue(value,this.min,this.max,this.step);

    this.onchange=onchange; // Call this when we change
    this.name=name;	    // for debugging

    this.sliderWidth=this.width-2;  // we don't use 1 pixel on each side

    // so our creator can find out.  It's our purpose in life
    this.getValue=function(){
	'use strict';
	return self.value;
    }

    this.setValue=function(newval){
	'use strict';
	var intval=checkValue(parseInt(newval,10),self.min,self.max,self.step);
	if(intval!=self.value){
	    self.value=intval;
	    self.onchange();
	}
    }

    // This is the eventhandler for the slider
    // it returns true if we don't consume the event, else
    // returns cancelEvent(e) (which returns false)
    // x,y - canvas relative x and y
    // e - the actual event
    this.eventhandler=function(x,y,e)
    {
	// at the end if value is still oldvalue, then we didn't react to the
	// event noticably, so we won't call the onChange handler
	'use strict';
	var oldvalue=self.value;

	if(e.type=='keydown'){
	    // we only care about cursor key movement
	    if(e.keyCode==36){
		// <Home> key
		self.value=checkValue(self.min,self.min,self.max,self.step);
	    } else if(e.keyCode==35){
		// <End> key
		self.value=checkValue(self.max,self.min,self.max,self.step);
	    } else if(e.keyCode==33){
		// <Page Up> key
		self.value=checkValue(self.value+2*self.step,self.min,self.max,self.step);
	    } else if(e.keyCode==34){
		// <Page Down> key
		self.value=checkValue(self.value-2*self.step,self.min,self.max,self.step);
	    } else if(e.keyCode>=37 && e.keyCode<=40){
		if(e.keyCode==37 || e.keyCode==39){
		    // <left> or <right>
		    self.value=
			checkValue(self.value+(e.keyCode-38)*self.step,
				self.min,self.max,self.step);
		}else if(e.keyCode==38 || e.keyCode==40){
		    // <up> or <down>
		    self.value=
			checkValue(self.value-(e.keyCode-39)*self.step,
				self.min,self.max,self.step);
		}
		// make sure we're in range
	    }else{
		// don't cancel the event, maybe someone else can use the key
		return true;
	    }
	    // If we get here, we potentially changed something.
	    if(self.value!=oldvalue){
		// if we changed call the onChange callback
		self.onchange();
	    }
	    // we consumed it, so cancel it
	    return cancelEvent(e);
	}else if(e.type=='touchmove'||e.type=='touchstart'||e.type=='touchstart'){
	    // if we get a touch event we cancel all existing mouse listens
	    // because, we only expect touch from now on.
	    if(self.mousedownID){
		self.eventmanager.quitlistening('mousedown',self.mousedownID);
		self.mousedownID=null;
	    }
	    if(self.mousewheelID){
		self.eventmanager.quitlistening('mousewheel',self.mousewheelID);
		self.mousewheelID=null;
	    }
	    if(self.DOMMouseScrollID){
		self.eventmanager.quitlistening('DOMMouseScroll',self.DOMMouseScrollID);
		self.DOMMouseScrollID=null;
	    }
	    if(self.mousemoveID){
		self.eventmanager.quitlistening('mousemove',self.mousemoveID);
		self.mousemoveID=null;
	    }
	    if(self.mouseupID){
		self.eventmanager.quitlistening('mouseup',self.mouseupID);
		self.mouseupID=null;
	    }
	    if(self.mouseclickID){
		self.eventmanager.quitlistening('mouseclick',self.mouseclickID);
		self.mouseclickID=null;
	    }
	    // if we get a touchstart, listen for touchmove and touchend
	    if(e.type=='touchstart'){
		if(self.touchmoveID==null){
		    self.touchmoveID=self.eventmanager.listen('touchmove',self.hit,self.eventhandler);
		}
		if(self.touchendID==null){
		    self.touchendID=self.eventmanager.listen('touchend',self.hit,self.eventhandler);
		}
	    }else if(e.type=='touchend'){
		// They lifted finger, quit listening to touchmove and touchend
	        if(self.touchmoveID){
		    self.eventmanager.quitlistening('touchmove',self.touchmoveID);
		}
	        if(self.touchendID){
		    self.eventmanager.quitlistening('touchend',self.touchendID);
		}
	    }
	}else if(e.type=='DOMMouseScroll' || e.type=='mousewheel'){
	    // simple, just change the value by step in the right direction
	    self.value=checkValue(self.value-wheelDirection(e)*self.step,self.min,self.max,self.step);
	    if(self.value!=oldvalue){
		self.onchange();
	    }
	    return cancelEvent(e);
	}else if(e.type=='mousedown'){
	    // turn on listening to mousemove, mouseup, mouseclick, mouseout
	    if(!self.mousemoveID){
		self.mousemoveID=self.eventmanager.listen('mousemove',self.hit,self.eventhandler);
	    }
	    if(!self.mouseupID){
		self.mouseupID=self.eventmanager.listen('mouseup',self.hit,self.eventhandler);
	    }
	    if(!self.mouseclickID){
		self.mouseclickID=self.eventmanager.listen('mouseclick',self.hit,self.eventhandler);
	    }
	    if(!self.mouseoutID){
		// we need to know when the mouse leaves so we can stop 
		// listening for stuff
		self.mouseoutID=self.eventmanager.listen('mouseout',self.hit,self.eventhandler);
	    }
	}else if(e.type != 'mousemove'){
	    // only other thing we react to now is move, if it's not move
	    // it's mouse up or click or mouseout, turn off listeners
	    if(self.mousemoveID){
		self.eventmanager.quitlistening('mousemove',self.mousemoveID);
		self.mousemoveID=null;
	    }
	    if(self.mouseupID){
		self.eventmanager.quitlistening('mouseup',self.mouseupID);
		self.mouseupID=null;
	    }
	    if(self.mouseclickID){
		self.eventmanager.quitlistening('mouseclick',self.mouseclickID);
		self.mouseclickID=null;
	    }
	    if(self.mouseoutID){
		self.eventmanager.quitlistening('mouseout',self.mouseoutID);
		self.mouseoutID=null;
	    }
	    // hmmm, did we consume that one or not?  It did make us stop
	    // listening, i.e. it was the end of our conversation...guess
	    // it was ours so we'll still cancel
	    return cancelEvent(e);
	}

	// Now we think we're a mousemove
	if(self.orientation===SLIDER_HORIZONTAL){
	    self.value=checkValue(self.min+(self.range)*(x-(self.x+self.sliderWidth/2))/(self.length-self.sliderWidth),self.min,self.max,self.step);
	}else{
	    // orientation is vertical, the y will decide the value
	    self.value=checkValue(self.max-(self.range)*(y-(self.y+self.sliderWidth/2))/(self.length-self.sliderWidth),self.min,self.max,self.step);
	}
	if(self.value!=oldvalue){
	    self.onchange();
	}
    }
    // valueToPos - turns the current value into a pixel offset into the slider
    this.valueToPos=function()
    {
	'use strict';
	if(this.orientation===SLIDER_HORIZONTAL){
	    return (this.length-this.sliderWidth)*((this.value-this.min)/(this.max-this.min))+this.sliderWidth/2;
	}else{
	    return (this.length-this.sliderWidth)*((this.max-this.value)/(this.max-this.min))+this.sliderWidth/2;
	}

    }
    // This draws our pretty slider self.
    this.draw=function()
    {
	'use strict';
	this.ctx.save();    // Make us reentrant
	// set up translation, scaling and rotation so that we can always
	// draw with the same set of commands no matter the orientation of
	// the slider
	this.ctx.translate(this.x,this.y);
	if(this.orientation===this.vertical){
	    ctx.scale(-1,1);
	    ctx.rotate(Math.PI/2);
	}
	// the slider background is a medium grey
	this.ctx.fillStyle="rgba(180,180,180,1)";
	this.ctx.fillRect(0,0,this.length,this.width);
	// highlight bottom and right edges with white
	this.ctx.lineWidth=1.0;
	this.ctx.strokeStyle="rgba(255,255,255,1)";
	this.ctx.beginPath();
	this.ctx.moveTo(0,this.width);
	this.ctx.lineTo(this.length,this.width);
	this.ctx.lineTo(this.length,0);
	this.ctx.stroke();
	// low light top and left edges with black
	this.ctx.strokeStyle="rgba(0,0,0,1)";
	this.ctx.beginPath();
	this.ctx.moveTo(0,this.width);
	this.ctx.lineTo(0,0);
	this.ctx.lineTo(this.length,0);
	this.ctx.stroke();
	// draw ticks with tiny grey circles
	this.ctx.strokeStyle="rgba(90,90,90,1)";
	for(var ctr=0;ctr<=(this.max-this.min);ctr++){
	    var stepxsize=(this.length-this.sliderWidth)/((this.max-this.min)/this.step);
	    this.ctx.beginPath();
	    this.ctx.arc(stepxsize*ctr+this.sliderWidth/2,
		    this.width/2,.5,0,2*Math.PI,true);
	    this.ctx.stroke();
	}
	// Now make the thumb (no it's not dumb - geez, are you three?)
	this.ctx.fillStyle="rgba(230,230,230,1)";
	this.ctx.strokeStyle="rgba(220,220,220,1)";
	var pos=this.valueToPos();
	this.ctx.lineWidth=1.0;
	this.ctx.beginPath();
	this.ctx.arc(pos,this.width/2,this.sliderWidth/2,0,2*Math.PI,false);
	this.ctx.fill();
	this.ctx.stroke();
	// Now make the highlight for the slider
	this.ctx.strokeStyle="rgba(255,255,255,1)";
	this.ctx.beginPath();
	this.ctx.arc(pos,this.width/2,this.sliderWidth/2,0.9*Math.PI,1.60*Math.PI,false);
	this.ctx.stroke();
	// Now make the low-light for the slider
	this.ctx.strokeStyle="rgba(100,100,100,1)";
	this.ctx.beginPath();
	this.ctx.arc(pos,this.width/2,this.sliderWidth/2,.00*Math.PI,0.65*Math.PI,false);
	this.ctx.stroke();
	this.ctx.restore();
    }

    // an easy way to keep track of us on screen.
    if(this.orientation==SLIDER_HORIZONTAL){
	this.bb=new boundingBox(this.x,this.y,this.length,this.width);
    }else{
	this.bb=new boundingBox(this.x,this.y,this.width,this.length);

    }

    // called from event manager to ask us if an x,y pair is us.  Return true
    // to get whatever event it is.
    this.hit=function(x,y,e){
	'use strict';
	if(x>=self.bb.x1 && x<=self.bb.x2 && y>=self.bb.y1 && y<=self.bb.y2){
	    return true;
	}else{
	    return false;
	}
    }

    // These are the initial events we listen on always
    this.keydown=
	this.eventmanager.listen('keydown',this.hit,self.eventhandler);
    // We'll quit mouse events if we get touch events
    this.mousedownID=
	this.eventmanager.listen('mousedown',this.hit,self.eventhandler);
    this.mousewheel=
	this.eventmanager.listen('mousewheel',this.hit,self.eventhandler);
    this.DOMMouseScrollID=
	this.eventmanager.listen('DOMMouseScroll',this.hit,self.eventhandler);
    // The next one turns off the preceeding mouse ones if we receive it
    this.touchstartID=
	this.eventmanager.listen('touchstart',this.hit,self.eventhandler);
    this.touchmoveID=null;
    this.touchendID=null;
    this.mousemoveID=null;
    this.mouseupID=null;
    this.mouseclickID=null;
}

// object used by event manager to keep track of interested parties
function eventListener(id, eventType, hit, callback)
{
    'use strict';
    this.id=id;	// unique sequential id so people can cancel
    this.eventType=eventType;
    this.hit=hit;   // call with x,y to see if they really want it
    this.callback=callback; // pass event to here
    this.toString=function() {
	return 'eventListener('+id+','+eventType+','+hit+','+'callback'+')'; }
}

// eventManager receives events from the browser and passes them on to things
// on the canvas which registered rectangular areas they cared about.
function eventManager(canvasManager)
{
    'use strict';
    var self=this;  // We get called in other context, so remember us
    this.id=0;	    // Bump this by one for each listen
    this.queues=new Object();
    // So far, we only use this to get canvas, so why don't we just pass the
    // canvas?  I suspect that later we might need to get to other parts.
    this.canvasManager=canvasManager;

    // Call this to express an interest in listening to a particular event type
    // eventType - string with something like 'keydown' or 'mousemove'
    // hit - a routine that we can call with an x,y offset on the canvas to
    //	    ask if you're interested in the event.  Returns true if so
    // callback - if hit is true, we call the callback passing it the event
    // returns - the id of the event
    this.listen=function(eventType, hit, callback)
    {
	'use strict';
	var queue=this.queues[eventType];
	if(queue==null){
	    // No one's asked to listen to this yet, make a queue to 
	    // store it in.
	    this.queues[eventType]=new Array();
	    queue=this.queues[eventType];
	}else{
	    // Check to see if it's a duplicate
	    for(var ctr=0;ctr<queue.length;ctr++){
		if(eventType==queue[ctr].eventType
			&& hit==queue[ctr].hit
			&& callback==queue[ctr].callback){
		    alert('duplicate! ctr: '+ctr
			    +' eventType: '+queue[ctr].eventType
			    +' x: '+queue[ctr].boundingbox.x
			    +' y: '+queue[ctr].boundingbox.y
			    +' xextent: '+queue[ctr].boundingbox.xextent
			    +' yextent: '+queue[ctr].boundingbox.yextent);
		    return queue[ctr].id;
		}
	    }
	}
	// If we get down here, we're adding a new eventListener
	queue[queue.length]=new eventListener(this.id,eventType, hit, callback);
	if(queue.length==1){
	    // First thing added to this queue, so start listening for this
	    // event on the canvas
	    hookEvent(this.canvasManager.canvas,eventType,this.eventhandler);
	}
	this.id=this.id+1;  // bump so next listen gets different id
	
	return this.id-1;   // return value before the bump
    }

    // quitlistening is called when we're tired of listening for an event
    // eventType - string with something like 'keydown' or 'mousemove'
    // id - the same id that was returned from listen
    this.quitlistening=function(eventType,id)
    {
	'use strict';
	var queue=this.queues[eventType];
	if(queue==null){
	    // they aren't listening those silly gooses.
	    return;
	}
	for(var ctr=0;ctr<queue.length;ctr++){
	    if(queue[ctr].id==id){
		queue.remove(ctr,ctr);
	    }
	    if(queue.length==0 &&
		    eventType != 'mouseover' && eventType != 'mouseout'){
		// nobody is listening anymore, so we'll quit listening
		// We always listen for mouseover and mouseout though.
		unhookEvent(this.canvasManager.canvas,eventType,this.eventhandler);
	    }
	}
    }

    // eventhandler for eventManager
    // At the global level, as an event goes down through the capture and
    // then back up through the global stage, anyone can stop the 
    // propogation of the event. (Note that I don't allow my children
    // to choose one or the other.  I always ask for bubble events so
    // that's what they get.
    //
    // The W3C DOM2 Event spec, says that even if stopPropagation is 
    // called on an element, that the event will be dispatched to all
    // event listeners on the current element.  So, one interpretation,
    // since all the listeners in my queue are on the same canvas would
    // be for me to keep dispatching.  Another interpretation would have
    // me only dispatch to the same subelement.  We don't allow multiple
    // registers from the same element unless they use different dispatch
    // routines or different hit routines.  If they differ with hit 
    // routines or dispatch routines we do.
    // I completely ignore preventDefault since I don't execute that.
    //
    // Another problem is key events.  Since I use mouse x,y to decide who
    // should receive the event on the canvas, and key events don't have
    // associated x,y values, they never hit, but are passed to whoever has
    // focus.  That means you have to click on something to get it to receive
    // the key events.
    this.eventhandler=function(e)
    {
	'use strict';
	var xy;
	if(!e){
	    var e=window.event;
	}
	self.canvasManager.canvas.focus();
	if(e.type=='mouseout'){
	    self.canvasManager.canvas.blur();
	}

	var xy=getCanvasCursorPosition(e,self.canvasManager.canvas);
	var queue=self.queues[e.type];
	var passon=true;  //  if true we didn't consume the event

	if(queue!=null){
	    for(var ctr=0;ctr<queue.length;++ctr){
		var el=queue[ctr];
		if(el.hit(xy[0],xy[1],e)){
		    // we found someone listening on that part of canvas
		    if(!el.callback(xy[0],xy[1],e)){
			// they consumed it
			passon=false;
		    }
		    if(e.type=='mousedown' || e.type=='touchstart'
			|| e.type=='mousewheel' || e.type=='DOMMouseScroll'
			|| e.type=='touchmove'  || e.type=='touchend'
			|| e.type=='touchdown'  || e.type=='keydown'
			    ){
			// give the focus to whoever gets this event
			self.mousefocusedCB=el.callback;
		    }

		} else if(el.callback==self.mousefocusedCB
		       && (e.type=='mouseup'    || e.type=='mouseout'
			|| e.type=='click'      || e.type=='mousemove'
			|| e.type=='touchmove'  || e.type=='touchend'
			|| e.type=='mousewheel' || e.type=='DOMMouseScroll'
			|| e.type=='keydown')){
		    // if the bounding box didn't match, but they are the
		    // one with mouse focus send it to them anyway.
		    if(!self.mousefocusedCB(xy[0],xy[1],e)){
			// they consumed it
			passon=false;
		    }
		    if(  e.type != 'mousemove' && e.type != 'touchmove'
		      && e.type !='mousewheel' && e.type != 'DOMMouseScroll'
		      && e.type != 'keydown' ){
			// but they lose the focus for anything but movement
			self.mousefocusedCB=null;
		    }
		}
	    }
	}
	// passon is true if we didn't cancel, else false
	return passon;
    }
    // we always listen for mouseout and mouseover
    hookEvent(this.canvasManager.canvas,'mouseout',this.eventhandler);
    hookEvent(this.canvasManager.canvas,'mouseover',this.eventhandler);
}

function Clock(id)
{
  var clockcanvas=document.getElementById(id);
  var ctx=clockcanvas.getContext('2d');
  var pi=Math.PI;	            // just for convenience
  this.now;		            // so we know what time it is.
  var xc=clockcanvas.width/2;	    // x center of clock
  var yc=clockcanvas.height/2;      // y center of clock
  var radius=Math.min(.85*xc,.85*yc); // size of the radius of the circle 
  var fontsize=radius/3;


  this.start=function()
  {
    setInterval(this.drawclock,1000);  // 1000ms is 1 sec
  }

  var drawbody=function()
  {
    ctx.save();
    // Shadows from the clock itself
    ctx.shadowOffsetX=Math.max(.04*radius,1);
    ctx.shadowOffsetY=Math.max(.04*radius,1);
    ctx.shadowBlur=Math.max(.04*radius,1);
    ctx.shadowColor='rgba(0,0,0,.2)';
    ctx.beginPath();
    ctx.arc(xc,yc,radius,0,2*pi,false);   // border of clock
    ctx.fillStyle='rgb(255,255,180)';	  // sort of a grey orange background
    ctx.fill();				  // fill first
    ctx.strokeStyle='rgb(30,110,30)';
    ctx.lineWidth=Math.max(radius/5,1);
    ctx.stroke();			  // and then stroke
    ctx.strokeStyle='rgb(70,150,80)';
    ctx.lineWidth=Math.max(radius/15,1);
    ctx.stroke();			  // and then stroke
    ctx.restore();
  }

  var drawback=function()
  {
    ctx.save();
    // draw a dark circle in middle, later after the hands are drawn we'll
    // add a smaller golden circle in the middle
    ctx.beginPath();
    ctx.moveTo(xc,yc);
    
    ctx.arc(xc,yc,Math.max(.03*radius,1),0,2*pi,false);
    ctx.stroke();

    // Now we'll draw the minute and second marks
    ctx.beginPath();
    for(var ctr=0; ctr<60;ctr++){
      var angle=ctr*2*pi/60;
      var x1=(.9*radius)*Math.cos(angle)+xc;
      var y1=(.9*radius)*Math.sin(angle)+yc;
      var x2=(.95*radius)*Math.cos(angle)+xc;
      var y2=(.95*radius)*Math.sin(angle)+yc;
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineWidth=1;
      ctx.stroke();
    }

    // Next are the fatter longer hour marks
    ctx.beginPath();
    ctx.lineWidth=Math.max(.05*radius,1);
    for(var ctr=0; ctr<12;ctr++){
      var angle=ctr*2*pi/12;
      var x1=(.8*radius)*Math.cos(angle)+xc;
      var y1=(.8*radius)*Math.sin(angle)+yc;
      var x2=(.95*radius)*Math.cos(angle)+xc;
      var y2=(.95*radius)*Math.sin(angle)+yc;
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
    }

    // Next we draw the hour numbers.  We start at 3 because that 
    // corresponds to 0 degrees
    var hours=['3','4','5','6','7','8','9','10','11','12','1','2'];
    ctx.font = fontsize+"px Times,'Times New Roman',sans-serif";
    ctx.textBaseline='middle';
    for(var ctr=0;ctr<12;ctr++){
	var angle=ctr*2*pi/12;
	var len=.5*radius;
	// we adust the x with an equation using cosine and the y with
	// an equation using sin so that the text looks like it's in an
	// even circle
	var x=len*Math.cos(angle)+xc-((1-Math.cos(angle))/2)*ctx.measureText(hours[ctr]).width;
	var y=len*Math.sin(angle)+yc+fontsize/3*Math.sin(angle);
	ctx.fillText(hours[ctr],x,y);
    }
    ctx.restore();
  }

  var drawhands=function()
  {
    ctx.save();
    ctx.shadowBlur=Math.max(.02*radius,1);

    // Make a shadow for the center staff that the hands can be drawn on
    ctx.fillStyle='rgb(100,80,40,0)';
    for(var ctr=0;ctr<Math.max(.07*radius,1);ctr+=.1){
	ctx.shadowColor='rgba(0,0,0,.01)';
	ctx.beginPath();
	ctx.shadowOffsetX=ctr;
	ctx.shadowOffsetY=ctr;
	ctx.arc(xc,yc,Math.max(.04*radius,1),0,2*pi,false);
	ctx.fill();
    }

    ctx.shadowColor='rgba(0,5,0,.5)';

    // Now the hour hand, first a skinnier front hand
    ctx.fillStyle='rgb(0,0,0)';
    ctx.shadowOffsetX=Math.max(.03*radius,1);
    ctx.shadowOffsetY=Math.max(.03*radius,1);
    var hourangle=3*pi/2+(2*pi/12)*(self.now.getHours()+self.now.getMinutes()/60);
    var hourx=(.5*radius)*Math.cos(hourangle)+xc;
    var houry=(.5*radius)*Math.sin(hourangle)+yc;
    ctx.lineWidth=Math.max(.03*radius,1);
    drawArrow(ctx,xc,yc,hourx,houry,3,1,Math.PI/4,.15*radius);
    // and the heavier back end
    var hourx=.2*radius*Math.cos(hourangle+pi)+xc;
    var houry=.2*radius*Math.sin(hourangle+pi)+yc;
    ctx.beginPath()
    ctx.moveTo(xc,yc);
    ctx.lineWidth=Math.max(.06*radius,1);
    ctx.lineTo(hourx,houry);
    ctx.stroke();

    ctx.shadowOffsetX=Math.max(.05*radius,1);
    ctx.shadowOffsetY=Math.max(.05*radius,1);

    // draw the minute hand we draw the front pointer part first,
    // then add a back heavier part
    var minuteangle=3*pi/2+(2*pi/60)*self.now.getMinutes();
    var minx=(.85*radius)*Math.cos(minuteangle)+xc;
    var miny=(.85*radius)*Math.sin(minuteangle)+yc;
    ctx.lineWidth=Math.max(.03*radius,1);// set up lineWidth for the drawArrow
    drawArrow(ctx,xc,yc,minx,miny,3,1,Math.PI/4,.2*radius);
    // Now the back heavier part
    var minx=.25*radius*Math.cos(minuteangle+pi)+xc;
    var miny=.25*radius*Math.sin(minuteangle+pi)+yc;
    ctx.beginPath();
    ctx.moveTo(xc,yc);
    ctx.lineWidth=Math.max(.06*radius,1);
    ctx.lineTo(minx,miny);
    ctx.stroke();

    // Second hand, red, same story, skinny front part first
    ctx.shadowOffsetX=Math.max(.07*radius,1);
    ctx.shadowOffsetY=Math.max(.07*radius,1);
    ctx.fillStyle='rgb(255,0,0)';
    ctx.strokeStyle='rgb(255,0,0)';
    var secondangle=3*pi/2+(2*pi/60)*self.now.getSeconds();
    var secx=(.75*radius)*Math.cos(secondangle)+xc;
    var secy=(.75*radius)*Math.sin(secondangle)+yc;
    ctx.lineWidth=1.01;
    drawArrow(ctx,xc,yc,secx,secy,3,1,Math.PI/20,.22*radius);
    // thicker back part later
    var secx=.25*radius*Math.cos(secondangle+pi)+xc;
    var secy=.25*radius*Math.sin(secondangle+pi)+yc;
    ctx.beginPath();
    ctx.moveTo(xc,yc);
    ctx.lineWidth=Math.max(.04*radius,1);
    ctx.lineTo(secx,secy);
    ctx.stroke();

    // draw the center of the clock
    ctx.fillStyle='rgb(100,80,40)';
    ctx.beginPath();
    ctx.arc(xc,yc,Math.max(.04*radius,1),0,2*pi,false);
    ctx.fill();

    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(xc,yc);
    ctx.fillStyle='rgb(255,255,0)';
    ctx.arc(xc,yc,Math.max(.03*radius,1),0,2*pi,false);
    ctx.fill();
  }

  var drawhighlights=function()
  {
    ctx.save();
    // draw a highlight around the edge of the glass
    // Note the alpha so everything shows through it
    ctx.shadowOffsetX=Math.max(.05*radius,1);
    ctx.shadowOffsetY=Math.max(.05*radius,1);
    ctx.shadowBlur=Math.max(.08*radius,1);
    ctx.shadowColor='rgba(0,0,0,.5)';
    ctx.strokeStyle='rgba(255,255,255,.40)';
    ctx.lineWidth=Math.max(.1*radius,1);
    ctx.beginPath();
    ctx.arc(xc,yc,.9*radius,0,2*pi,false);
    ctx.stroke();

    // then a skinnier highlight inside the other
    // Note the alpha is higher so you can barely see through it
    ctx.strokeStyle='rgba(255,255,255,.45)';
    ctx.lineWidth=Math.max(.03*radius,1);
    ctx.beginPath();
    ctx.arc(xc,yc,.90*radius,0,2*pi,false);
    ctx.stroke();

    // then a highlight in the center of the glass
    // the alpha makes it barely there
    ctx.beginPath();
    var grad=ctx.createRadialGradient(xc+.1*radius,yc-.3*radius,10,xc,yc,radius);
    grad.addColorStop(0,'rgba(255,255,255,.2)');
    grad.addColorStop(.01,'rgba(255,255,255,.1)');
    grad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=grad;
    ctx.arc(xc,yc,radius,0,2*pi,false);
    ctx.fill();
    ctx.restore();
  }

  this.drawclock=function()
  {
    ctx.save();
    this.now=new Date();

    // got to clear it each time through or the hands smear
    ctx.clearRect(0,0,clockcanvas.width,clockcanvas.height);

    // default our stroke and fill styles
    ctx.strokeStyle='rgb(0,0,0)';
    ctx.fillStyle='rgb(0,0,0)';
    ctx.shadowOffsetX=0;
    ctx.shadowOffsetY=0;
    ctx.shadowBlur=0;
    ctx.shadowColor='rgba(0,0,0,0)';

    // next draw the background and border of the clock
    drawbody();
    drawback();
    drawhands();
    drawhighlights();
    

    // Turn off all shadows
    /*
    ctx.shadowOffsetX=0;
    ctx.shadowOffsetY=0;
    ctx.shadowBlur=0;
    ctx.shadowColor='rgba(0,0,0,0)';
    */
    delete this.now;
  }
}
      var scale_image=function(img,xsize,ysize,ctx,callback,error_cb){
	// we'd like this to scale exactly to size, but since size
	// could be something like 28.75, and images can only be an exact
	// number of pixels wide, then we can't.
	// make a tmp canvas to render into
	var tmpcvs=document.createElement('canvas');
	// and set it to be the image size
	tmpcvs.height=ysize;
	tmpcvs.width=xsize;
	// grab its context so we can draw
	var tmpctx=tmpcvs.getContext('2d');
	// and draw the image scaled to that size
	tmpctx.drawImage(img,0,0,xsize,ysize);
	// now we get the data from the canvas
	var dataurl=tmpcvs.toDataURL();
	// create a new image,
	var sclimage=new Image();
	// and set it to the data from the canvas.  Once that's done,
	// we will call the callback passing it the contex, and the scaled 
	// image.
	sclimage.onload=function(){
	  callback(ctx,sclimage);
	}
	sclimage.onerror=function(){
	  error_cb(ctx);
	}
	sclimage.src=dataurl;
      }
	
      var makerectimage=function(xsize,ysize,color,callback,brdrsz,brdrclr){
	if (typeof brdrsz == "undefined" ){
	    brdrsz = 0;
	}else {
	    if (typeof brdrclr == "undefined" ){
		brdrclr = 'rgb(0,0,0)';
	    } 
	}
	console.log("makerectimage("+xsize+','+ysize+','+color+")");
	var tmpcvs=document.createElement('canvas');
	// and set it to be the image size
	tmpcvs.height=ysize;
	tmpcvs.width=xsize;
	// grab its context so we can draw
	var tmpctx=tmpcvs.getContext('2d');
	// and draw the image scaled to that size
	tmpctx.fillStyle=color;
	tmpctx.fillRect(0,0,xsize,ysize);
	if(brdrsz>0){
	    tmpctx.strokeStyle=brdrclr;
	    tmpctx.lineWidth=brdrsz;
	    tmpctx.strokeRect(0,0,xsize,ysize);
	}

	// now we get the data from the canvas
	var dataurl=tmpcvs.toDataURL();
	// create a new image,
	var sclimage=new Image();
	// and set it to the data from the canvas.  Once that's done,
	// we will call the callback passing it the contex, and the scaled 
	// image.
	sclimage.onload=function(){
	  console.log("in makerectimage in sclimage.onload calling callback");
	  callback(sclimage);
	}
	sclimage.src=dataurl;
      }

