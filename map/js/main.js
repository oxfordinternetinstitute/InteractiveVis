$(function() {
	
	// map
	var canvas=$('#canvas');
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
	var chart=Raphael(elem.attr('id'), elem.parent().width(), elem.parent().height()-$('#chartname').outerHeight());
	var plot={};
	plot.x=0;
	plot.y=0;
	plot.gutter=Math.round(chart.width*0.1);
	plot.width=(chart.width-(plot.gutter*(chartlabels.length-1)))/chartlabels.length;
	plot.height=chart.height;
	
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
	$('#toolbar #reset').click(reset);
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
		e.preventDefault();
		var width, height;
		width=viewbox.width;
		height=viewbox.height;
		var factor;
		if (delta<0) factor=0.95;
		else factor=1.05;
		if (((viewbox.width*factor/image.width)>=0.05||(viewbox.height*factor/image.height)>=0.025) && 
		((viewbox.width*factor/image.width)<=1||(viewbox.height*factor/image.height)<=1)) {
			viewbox.width*=factor;
			viewbox.height*=factor;
			viewbox.x-=(viewbox.width-width)*0.5;
			viewbox.y-=(viewbox.height-height)*0.5;
			map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
		}
	}
	
	function move (s) {
		return function(dx, dy) {
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
		if ($(window).width()>=$(window).height()) scale=$(window).width()/image.width;
		else scale=$(window).height()/image.height;
		canvas.css({
			'width': image.width*scale+'px',
			'height': image.height*scale+'px',
			'margin': '0 auto'
		});		
		svg.css({
			'width': image.width*scale+'px',
			'height': image.height*scale+'px',
			'margin': '0 auto'
		});
		map.setSize(svg.width(), svg.height());
	}
	
	function reset(e) {
		e.preventDefault();
		var s=viewbox.width/image.width;
		viewbox.x=viewbox.y=0;
		viewbox.width/=s;
		viewbox.height/=s;
		map.setViewBox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
	}
	
	function datachange(name, data) {
		$('#chartname').text(name);
		var maxvalue=100;
		var scale=plot.height/maxvalue;

		values.attr('opacity', 0);
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
			var h;
			if (data && !(isNaN(data[i]))) {
				h=data[i]*scale;
			} else {
				h=0*scale;
			}
			bars[i].animate({
					height: h, 
					y: plot.height-h}, 
				500, 
				'>',
				function() {
					values.animate({'opacity': 1}, 500);
				}
			);
		}
	}
	
	// initialize
	$(window).resize();
	svg.animate({'opacity': 1}, 500);
	  
});