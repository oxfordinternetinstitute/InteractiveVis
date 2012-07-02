//library=$(function() {
$(document).ready(function() {
	
	// map
	//var canvas=$('#canvas');
	var svg=$('#svg');
	var image=worldmap;
	var include=['XK','PS-GAZASTRIP','PS-WESTBANK'];
	var mapstyle={
		fill: ['#cccccc', '#eeeeee', '#0679a4'],
		stroke: '#999',
		'stroke-width': 0.25,
		'stroke-linejoin': 'round'
	};
	
	var map=Raphael(svg.attr('id'), svg.width(), svg.height());
	map.setStart();
	for (var country in image.shapes) {
		if (countrycodes.iso2[country]||$.inArray(country, include)>-1) paint(country);
	}
	obj=map.rect(0, 0, image.width, image.height, 0).attr({stroke: 'none', fill: '#fff', opacity: 0});
	obj.id='container';
	obj.toBack();
	var set=map.setFinish();
	
	var viewbox={
		x: 0,
		y: 0,
		width: image.width,
		height: image.height
	}
	map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
	
	// chart
	var elem=$('#chart');
	var chartlabels=['Total', 'Male', 'Female'];
	var chartsuffix='%';
	var chartstyle={};
	chartstyle.labels={'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#666'};
	chartstyle.plots={
		'colours': [
			{fill: '#d70060', stroke: 'none', 'stroke-width': 0},
			{fill: '#e54028', stroke: 'none', 'stroke-width': 0},
			{fill: '#f18d05', stroke: 'none', 'stroke-width': 0}],
		'text': [
			{'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#fff'},
			{'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#fff'},
			{'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#fff'}]
	};
	
	//var chart=Raphael(elem.attr('id'), elem.parent().width(), elem.parent().height()-(elem.position().top));
	var chart=Raphael(elem.attr('id'), elem.parent().width(), elem.parent().height());//-$('#chartname').outerHeight()
	var plot={};
	plot.x=0;
	plot.y=0;
	plot.gutter=Math.round(chart.width*0.1);
	plot.width=(chart.width-(plot.gutter*(chartlabels.length-1)))/chartlabels.length;
	plot.height=Math.min(chart.height,300);
	
	var labels=chart.set();
	for (var i=0; i<chartlabels.length; i++) {
		var label=chart.text(plot.x+((plot.width+plot.gutter)*i)+plot.width/2, plot.y).attr(chartstyle.labels);
		var words=chartlabels[i].split(' '), tmp='';
		for (var n=0; n<words.length; n++) {
			label.attr('text', tmp+' '+words[n]);
			if (label.getBBox(0).width > plot.width) tmp+='\n'+words[n];
			else tmp+=' '+words[n];
		}
		label.attr('text', tmp.substring(1));		
		labels.push(label);
	}
	var labely=plot.height-labels.getBBox(0).height;
	for (var i=0; i<labels.length; i++) {
		labels[i].attr({y: labely+labels[i].getBBox(0).height/2});
	}
	plot.height=plot.height-labels.getBBox(0).height-5;

	var bars=chart.set();
	for (var i=0; i<chartlabels.length; i++) {
		chart.rect(plot.x+((plot.width+plot.gutter)*i), plot.y, plot.width, plot.height).attr({stroke:'none', fill:'#ccc'});
		var bar=chart.rect(plot.x+((plot.width+plot.gutter)*i), plot.y+plot.height, plot.width, 0).attr(chartstyle.plots.colours[i]);
		bars.push(bar);
	}

	var values=chart.set();
	for (var i=0; i<chartlabels.length; i++) {
		var value=chart.text(plot.x+((plot.width+plot.gutter)*i)+plot.width/2, 0).attr(chartstyle.plots.text[i]);
		if (chartsuffix) value.suffix=chartsuffix;
		value.attr('text', '0'+chartsuffix);
		values.push(value);
	}
	values.attr({y: values.getBBox(0).height/2});
	
	// initialize
	$(window).smartresize(resize);

	//buttons
	$("#reset").click(reset);
	$("#zoomIn").click(zoomOut);
	$("#zoomOut").click(zoomIn);
	$("#attributepane .left-close").click(function(){	
		$("#attributepane").hide();		
	});
	//more info
	$(".fb").fancybox({
        minWidth: 400,
        maxWidth: 800,
        minHeight: 300,
        maxHeight: 600
    });
	datachange('World', literacy['world']);
	set.drag(move(set), movestart);
	svg.mousewheel(zoom);    
	
	function paint(country) {
		var obj=map.path(image.shapes[country]);
		obj.id=country;
		obj.attr({
			fill: hex2rgb((literacy[country] && !isNaN(literacy[country][0])) ? scale2hex(literacy[country][0]) : '#ccc', 'string'),
			stroke: hex2rgb(mapstyle.stroke, 'string'),
			'stroke-width': mapstyle['stroke-width'],
			'stroke-linejoin': mapstyle['stroke-join']		
		})
		.mouseover(function(){
			this.animate({
				fill: 'rgba(247, 102, 10, 1)'
			}, 300);
		})
		.mouseout(function(){
			this.animate({
				fill: hex2rgb((literacy[country] && !isNaN(literacy[country][0])) ? scale2hex(literacy[country][0]) : '#ccc', 'string')
			}, 300);
		})
		.mousedown(function() {
			var name;
			if (countrycodes['iso2'][this.id]) name=countrycodes['iso2'][this.id].hname;
			else if (countrycodes['user-defined'][this.id]) name=countrycodes['user-defined'][this.id].hname;
			datachange(name, literacy[this.id]);
		});
	}
	
	function scale2hex(percentage) {
		if (percentage<=50) return'#e0e2e2';
		else if (percentage>50 && percentage<=60) return '#bac3cf';
		else if (percentage>60 && percentage<=70) return '#95aabd';
		else if (percentage>70 && percentage<=80) return '#7494ae';
		else if (percentage>80 && percentage<=90) return '#50799d';
		else if (percentage>90 && percentage<=100) return '#2e668e';	
	}
	
	function scale2rgb(percentage) {
		var minimum=hex2rgb(mapstyle.fill[1]), maximum=hex2rgb(mapstyle.fill[2]);
		var scale=percentage/100;
		var colours=[scale*maximum.r+(1-scale)*minimum.r, scale*maximum.g+(1-scale)*minimum.g, scale*maximum.b+(1-scale)*minimum.b];
		return 'rgb('+colours+')';
	}
	
	function hex2rgb (hex, format) {
		if (hex.charAt(0)=='#') hex=hex.substr(1);
		var r, g, b;
		if (hex.length==6) {
			r=hex.charAt(0)+''+hex.charAt(1);
			g=hex.charAt(2)+''+hex.charAt(3);
			b=hex.charAt(4)+''+hex.charAt(5);
		} else if (hex.length==3) {
			r=hex.charAt(0)+''+hex.charAt(0);
			g=hex.charAt(1)+''+hex.charAt(1);
			b=hex.charAt(2)+''+hex.charAt(2);
		}
		if (format=='string') return 'rgb('+[parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]+')';
		return {r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16)};
	}

	function zoom(e, delta) {
		var width, height,factor,x,y;
		width=viewbox.width;
		height=viewbox.height;

		centerX=viewbox.width/2+viewbox.x;
		centerY=viewbox.height/2+viewbox.y;
		
		if (e!=null) {
			e.preventDefault();
			coords=screen2svgCoords(e.clientX,e.clientY);
		}

		if (delta<0) factor=1.25;
		else factor=0.75;
				
		if (((viewbox.width*factor/image.width)>=0.05||(viewbox.height*factor/image.height)>=0.025) && 
		((viewbox.width*factor/image.width)<=1||(viewbox.height*factor/image.height)<=1)) {
			viewbox.width*=factor;
			viewbox.height*=factor;
			viewbox.x-=(viewbox.width-width)*0.5;
			viewbox.y-=(viewbox.height-height)*0.5;
			if (e!=null) {//line up map with mouse cursor
				coords2=screen2svgCoords(e.clientX,e.clientY);//updated coords
				dx=(coords.x-coords2.x);
				dy=(coords.y-coords2.y);
				viewbox.x=viewbox.x+dx;
				viewbox.y=viewbox.y+dy;
			}
			map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
		} else if ((viewbox.width*factor/image.width)>=0.05||(viewbox.height*factor/image.height)>=0.025) {
			//fully zoomed out, but let's center the image at this point
			reset(e);
		}
			
	}
	
	/*svg.click(fun);
	function fun(e){
		centerX=viewbox.width/2+viewbox.x;
		centerY=viewbox.height/2+viewbox.y;
		
		orginX1=viewbox.x;
		orginY1=viewbox.y;

		dx=(.75*viewbox.width-viewbox.width)/2;
		dy=(.75*viewbox.height-viewbox.height)/2;
		//alert(viewbox.x+","+viewbox.y+","+viewbox.width+","+viewbox.height);
		
		coords=screen2svgCoords(e.clientX,e.clientY);
		
		f=zoom(null,1);
		
		coords2=screen2svgCoords(e.clientX,e.clientY);
		
		//alert(coords.x-coords2.x);
		
		
		orginX2=viewbox.x;
		orginY2=viewbox.y;
		
		//alert(orginX1-orginX2-offsetX);
		
		//coords2=svg2screenCoords(coords.x,coords.y);	
		//map.path("M" + coords.x + "," + coords.y + "L" + coords2.x + "," + coords2.y);
		//x=map.circle(coords.x,coords.y,5);
		//x.transform("T"+(coords.x-centerX)+","+(coords.y-centerY));
		
		dx=(coords.x-coords2.x);
		dy=(coords.y-coords2.y);

		
		viewbox.x=viewbox.x+dx;
		viewbox.y=viewbox.y+dy;
		map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
	}*/
	
	function zoomIn(e)  {
		zoom(null,-1);
	}
	
	function zoomOut(e) {
		zoom(null,1);
	}
	
	function center(e){
		centerX=viewbox.width/2+viewbox.x;
		centerY=viewbox.height/2+viewbox.y;
		
		coords=screen2svgCoords(e.clientX,e.clientY);
		
		//map.path("M" + centerX + "," + centerY + "L" + coords.x + "," + coords.y);
		//x=map.circle(centerX,centerY,5);
		//x.transform("T"+(coords.x-centerX)+","+(coords.y-centerY));
		
		dx=(coords.x-centerX);
		dy=(coords.y-centerY);

		
		viewbox.x=viewbox.x+dx;
		viewbox.y=viewbox.y+dy;
		map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
	}

	
	function screen2svgCoords(x,y) {
		factor=viewbox.width/svg.width();
		svgX=(x*factor)+viewbox.x;
		svgY=(y*factor)+viewbox.y;
		return {x:svgX,y:svgY};
	}
	
	function svg2screenCoords(x,y) {
		factor=viewbox.width/svg.width();
		sX=(x-viewbox.x)/factor;
		sY=(y-viewbox.y)/factor;
		return {x:sX,y:sY};
	}	

	
	function move (s) {
		return function (dx, dy) {
			//(s||this).translate(dx-this.dx, dy-this.dy);
			var x, y, s;
			s=viewbox.width/image.width;
			x=viewbox.x-(dx-this.dx)*s;
			y=viewbox.y-(dy-this.dy)*s;
			if ((dx-this.dx<0 && x<(image.width/s)*0.5) || (dx-this.dx>0 && x>-((image.width*s)*0.5))) viewbox.x=x;
			if ((dy-this.dy<0 && y<(image.height/s)*0.5) || (dy-this.dy>0 && y>-((image.height*s)*0.5))) viewbox.y=y;
			map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
			this.dx=dx;
			this.dy=dy;
		}
	}
	
	function movestart () {
		this.dx=this.dy=0;
	}
	
	function resize(e) {
		var scale;
		
		//always scale on width
		//var limitWidth=false;
		if ($(window).width()>=$(window).height()) {
			scale=$(window).width()/image.width;
		} else {
			scale=$(window).height()/image.height;
		//	limitWidth=true;			
		}
		scale*=.95; //Reduce scale to  95% of max to avoid scroll bars in some browsers
		/*canvas.css({
			'width': image.width*scale+'px',
			'height': image.height*scale+'px',
			'margin': '0 auto'
		});	*/	
		svg.css({
			'width': '100%',
			'height': '100%',
			'margin': '0 auto'
		});
		
		var vdelta=(svg.height()-image.height*scale)/2;
		if (vdelta<0) vdelta=0;
		
		//TODO: THis isn't working
		var hdelta=(svg.width()-image.width*scale)/2;
		if (hdelta<0) hdelta=0;
		console.log("hdelta: "+hdelta);
		console.log("vdelta: "+vdelta);

		//console.log("Scale:  " + scale);
		//console.log($(window).width() +","+ $(window).height());
		//console.log("svg.height: " + svg.height() + "; Delta is: " + delta);
		//if (!limitWidth) {		
			//if scale is choosen based on height, use above instead.
			map.setSize(svg.width(), svg.height());
			//scale the map to fit and translate to center vertically
			console.log("scaling,translating");	
			set.transform("s" + scale + "," + image.width/2 +  "," + image.height/2  + "t" + hdelta + "," + vdelta);
		//} else {
		//	console.log("normal");
		//	map.setSize(image.width*scale,image.height*scale);
		//}
	}	
	
	function reset(e) {
		if (e!=null) e.preventDefault();
		//var s=viewbox.width/image.width;
		//console.log(s);
		viewbox.x=0;
		//delta=svg.height()-image.height*scale;
		viewbox.y=0;//delta/-2
		//viewbox.width/=s;
		//viewbox.height/=s;
		viewbox.width=image.width;
		viewbox.height=image.height;
		map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
	}
	
	function datachange(name, data) {
		animate = $("#attributepane").is(":visible"); //only animate if the panel is shown
		$("#attributepane").show();

		$('#chartname').text(name);
		var maxvalue=100;
		var scale=plot.height/maxvalue;

		if (animate) values.attr('opacity', 0);
		for (var i=0; i<values.length; i++) {
			var t, ty;
			if (data && !(isNaN(data[i]))) {
				t=new String(data[i]);
				t+=(values[i].suffix)?values[i].suffix:'';
				ty=plot.height-(data[i]*scale)+10;
			} else {
				t='n/a';
				ty=plot.y+plot.height-20;
			}
			values[i].attr('text', t);
			values[i].attr({y: ty});
		}
		

		for (var i=0; i<bars.length; i++) {
			var h=0;
			if (data && !(isNaN(data[i]))) {
				h=data[i]*scale;
			}
			
			//animale only if the pane is visible
			if( animate ) {
				bars[i].animate({
						height: h, 
						y: plot.height-h}, 
					500, 
					'>',
					function() {
						values.animate({'opacity': 1}, 500);
					}
				);
			} else {
				bars[i].attr({
						height: h, 
						y: plot.height-h}
				);
			}
			
		}
	}

	
	// initialize
	$(window).resize();
	svg.animate({'opacity': 1}, 500);


});
