//library=$(function() {
"use strict";
$(document).ready(function() {


//Load
var config={};
var data={};//Previusly mapData and countrycodes. These should no longer be used
jQuery.getJSON("config.json", function(conf, textStatus, jqXHR) {
	config=conf;
	
	if (!config.global || !config.global.type=="map") {
		//bad config
		alert("Cannot find configuration settings.");
		return;
	}
	
	jQuery.getJSON("data.json", function(datajson, textStatus, jqXHR) {
	data=datajson;
	
	var currentStat="";
	var altStats=[];
	var barStats=[];
	var textStats=[];
	for (var i=0; i<config.features.stats.length; i++) {
		var stat = config.features.stats[i];
		var leg = config["features"]["legend_"+stat]
		if (leg.type=="main_statistic") {
			currentStat=stat;
			altStats.push(stat);
		} else if (leg.type=="alternative_statistic") {
			altStats.push(stat);
		}
		
		if (leg.style=="bar") {
			barStats.push({"stat":stat,"label":leg.paneltitle,"color":leg.color});
		} else if (leg.style=="text") {
			textStats.push({"stat":stat,"label":leg.paneltitle});
		}
	}
	if (currentStat=="" && altStats.length>0) {
		currentStat=altStats[0];
	}
	
	//init GUI
	var logo="";//Default title
	if (config.logo.file) {
		/*<a href="http://www.oii.ox.ac.uk"><img src="images/oii_brand.png" alt="Oxford Internet Institute" class="logo" /></a><h1 id="textTitle">&nbsp;</h1>*/
		logo = "<img src=\"" + config.logo.file +"\"";
		if (config.logo.text) logo+=" alt=\"" + config.logo.text + "\"";
		logo+=">";
	} else if (config.logo.text) {
		logo="<h1>"+config.logo.text+"</h1>";
	}
	if (config.logo.link) logo="<a href=\"" + config.logo.link + "\">"+logo+"</a>";
	$("#maintitle").html(logo);
	//#title <h2>Literacy and  Gender</h2>
	$("#title").html("<h2>"+config.text.title+"</h2>");
	

	//#titletext
	$("#titletext").html(config.text.intro);
	
	//more information
	if (config.text.more) {
		$("#information").html(config.text.more);
	} else {
		//hide more information link
		$("#moreinformation").hide();
	}
	
	updateLegend();
	
	//alternative main stats?
	if (altStats.length>1) {
		var legendtitle=$('#legendtitle'), statoptions=$('<ul>', {id: 'altStats'});
		legendtitle.parent('#legend').addClass('hasAltStats');
		legendtitle.after(statoptions.hide());
		for (var i=0; i<altStats.length; i++) {
			//if (currentStat == altStats[i]) continue;
			var item=$('<li><a href="#"' + altStats[i] + ' data-altstat="'+altStats[i]+'">'+config["features"]["legend_"+altStats[i]].legendtitle+'</a></li>');
			item.children('a').click(function(evt){
				evt.preventDefault();
				$(this).parent().siblings('li').children('a').removeClass('selected');
				$(this).addClass('selected');
				changeMainStat($(this).attr('data-altstat'));
			});
			statoptions.append(item);
		}
		statoptions
		.on('show', function() {			
			if(statoptions.is(':animated')) {
				return false;
			}
			legendtitle.addClass('expanded');
			statoptions.slideDown(300);})
		.on('hide', function() {
			if(statoptions.is(':animated')) {
				return false;
			}
			legendtitle.removeClass('expanded');
			statoptions.slideUp(300);})
		.on('toggle', function() {
			if(legendtitle.hasClass('expanded')) statoptions.trigger('hide');
			else statoptions.trigger('show');
		});
		$('#legendtitle').click(function(){
			statoptions.trigger('toggle');
			return false;
		});
		$(document).click(function(){
			statoptions.trigger('hide');
		});	
	}
	
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
		/*if (countrycodes.iso2[country]||$.inArray(country, include)>-1) paint(country);
		else console.log("NOT printing " + country);
		Used to skip: XS,XP,XN,XO,XC,XA*/
		paint(country);
	}
	var obj=map.rect(0, 0, image.width, image.height, 0).attr({stroke: 'none', fill: '#fff', opacity: 0});
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
	if (barStats.length>0) {
		var elem=$('#chart');
		//var chartlabels=config.informationPanel.bars.labels;//['Total', 'Male', 'Female'];
		var chartsuffix=config.features.bars.units;//'%';
		var chartstyle={};
		chartstyle.labels={'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#666'};
		chartstyle.plots={'colors':[],'text':[]};
		for (var i=0; i<barStats.length; i++) {
			chartstyle.plots["colors"].push({fill: barStats[i].color, stroke: 'none', 'stroke-width': 0});
			chartstyle.plots["text"].push({'text-anchor': 'middle', 'font': '12px Helvetica, Arial, sans-serif', fill: '#fff'});
		}
	
		//var chart=Raphael(elem.attr('id'), elem.parent().width(), elem.parent().height()-(elem.position().top));
		var chart=Raphael(elem.attr('id'), elem.parent().width(), elem.parent().height());//-$('#chartname').outerHeight()
		var plot={};
		plot.x=0;
		plot.y=0;
		plot.gutter=Math.round(chart.width*0.1);
		plot.width=(chart.width-(plot.gutter*(barStats.length-1)))/barStats.length;
		plot.height=Math.min(chart.height,300);
	
		var labels=chart.set();
		for (var i=0; i<barStats.length; i++) {
			var label=chart.text(plot.x+((plot.width+plot.gutter)*i)+plot.width/2, plot.y).attr(chartstyle.labels);
			var words=barStats[i]["label"]
			if (words) {
				words=words.split(' ');
				var tmp='';
				for (var n=0; n<words.length; n++) {
					label.attr('text', tmp+' '+words[n]);
					if (label.getBBox(0).width > plot.width) tmp+='\n'+words[n];
					else tmp+=' '+words[n];
				}
				label.attr('text', tmp.substring(1));
			} else {		
				label.attr('text', "");
			}
			labels.push(label);
		}
		var labely=plot.height-labels.getBBox(0).height;
		for (var i=0; i<labels.length; i++) {
			labels[i].attr({y: labely+labels[i].getBBox(0).height/2});
		}
		plot.height=plot.height-labels.getBBox(0).height-5;

		var bars=chart.set();
		for (var i=0; i<barStats.length; i++) {
			chart.rect(plot.x+((plot.width+plot.gutter)*i), plot.y, plot.width, plot.height).attr({stroke:'none', fill:'#ccc'});
			var bar=chart.rect(plot.x+((plot.width+plot.gutter)*i), plot.y+plot.height, plot.width, 0).attr(chartstyle.plots.colors[i]);
			bars.push(bar);
		}

		var values=chart.set();
		for (var i=0; i<barStats.length; i++) {
			var value=chart.text(plot.x+((plot.width+plot.gutter)*i)+plot.width/2, 0).attr(chartstyle.plots.text[i]);
			if (chartsuffix) value.suffix=chartsuffix;
			value.attr('text', '0'+chartsuffix);
			values.push(value);
		}
		values.attr({y: values.getBBox(0).height/2});
	}//end if we have bars	
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
        maxHeight: 600
    });//        minHeight: 300,
    
    if (config.features.onLoad.enabled && config.features.onLoad.datapoint && data[config.features.onLoad.datapoint]) {
		datachange(data[config.features.onLoad.datapoint].paneltitle,
			data[config.features.onLoad.datapoint]);		
    } else {//hide panel on load
    	$("#attributepane").hide();
    }
    
	//datachange('World', mapData['world']);
	set.drag(move(set), movestart);
	svg.mousewheel(zoom);    
	
	function paint(country) {
		var obj=map.path(image.shapes[country]);
		var mainStat=data[country] && !isNaN(data[country][currentStat]);
		obj.id=country;
		obj.attr({
			fill: hex2rgb(mainStat ? scale2hex(data[country][currentStat]) : '#ccc', 'string'),
			stroke: hex2rgb(mapstyle.stroke, 'string'),
			'stroke-width': mapstyle['stroke-width'],
			'stroke-linejoin': mapstyle['stroke-join']		
		});
		
		if (data[country]) {//If no in data, don't provide any interaction
			obj.mouseover(function(){
				this.animate({
					fill: (config.features.countryHighlightColor?config.features.countryHighlightColor:'rgba(247, 102, 10, 1)')
				}, 300);
			})
			.mouseout(function(){
				this.animate({
					fill: hex2rgb((data[country] && !isNaN(data[country][currentStat])) ? scale2hex(data[country][currentStat]) : '#ccc', 'string')
				}, 300);
			})
			.mousedown(function() {
				/*var name;
				if (countrycodes['iso2'][this.id]) name=countrycodes['iso2'][this.id].hname;
				else if (countrycodes['user-defined'][this.id]) name=countrycodes['user-defined'][this.id].hname;*/
				var name = data[this.id].label;
				datachange(name, data[this.id]);
			});
		}
	}
	
	function scale2hex(value) {
		var legend = config["features"]["legend_"+currentStat];
		var color="#888888";
		for (var i=0; i<legend.cutpoints.length;i++) {
			if (value<legend.cutpoints[i]) {
				return legend.colors[i];
			}
		}
		return legend.colors[legend.colors.length-1];
	}
	
	/*function scale2rgb(percentage) {
		var minimum=hex2rgb(mapstyle.fill[1]), maximum=hex2rgb(mapstyle.fill[2]);
		var scale=percentage/100;
		var colours=[scale*maximum.r+(1-scale)*minimum.r, scale*maximum.g+(1-scale)*minimum.g, scale*maximum.b+(1-scale)*minimum.b];
		return 'rgb('+colours+')';
	}*/
	
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
		var width=viewbox.width;
		var height=viewbox.height;

		var centerX=viewbox.width/2+viewbox.x;
		var centerY=viewbox.height/2+viewbox.y;
		
		var coords;
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
				var coords2=screen2svgCoords(e.clientX,e.clientY);//updated coords
				var dx=(coords.x-coords2.x);
				var dy=(coords.y-coords2.y);
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
		var factor=viewbox.width/svg.width();
		var svgX=(x*factor)+viewbox.x;
		var svgY=(y*factor)+viewbox.y;
		return {x:svgX,y:svgY};
	}
	
	function svg2screenCoords(x,y) {
		var factor=viewbox.width/svg.width();
		var sX=(x-viewbox.x)/factor;
		var sY=(y-viewbox.y)/factor;
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
		//console.log("hdelta: "+hdelta);
		//console.log("vdelta: "+vdelta);

		//console.log("Scale:  " + scale);
		//console.log($(window).width() +","+ $(window).height());
		//console.log("svg.height: " + svg.height() + "; Delta is: " + delta);
		//if (!limitWidth) {		
			//if scale is choosen based on height, use above instead.
			map.setSize(svg.width(), svg.height());
			//scale the map to fit and translate to center vertically
			//console.log("scaling,translating");	
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
		var animate = $("#attributepane").is(":visible"); //only animate if the panel is shown
		$("#attributepane").show();

		$('#chartname').text(name);
		
		if (barStats.length>0) {
			var maxvalue=config.features.bars.maxvalue;
			var scale=plot.height/maxvalue;
			if (animate) values.attr('opacity', 0);
			for (var i=0; i<values.length; i++) {
			//for (var i=0; i<chartlabels.length; i++) {
				var stat=barStats[i]["stat"];//config.informationPanel.bars.stats[i];
				var t, ty;
				if (data && !(isNaN(data[stat]))) {
					t=new String(data[stat]);
					t+=(values[i].suffix)?values[i].suffix:'';
					ty=plot.height-(data[stat]*scale)+10;
				} else {
					t='n/a';
					ty=plot.y+plot.height-20;
				}
				values[i].attr('text', t);
				values[i].attr({y: ty});
			}
		

			for (var i=0; i<bars.length; i++) {
				var stat=barStats[i]["stat"];//config.informationPanel.bars.stats[i];
				var h=0;
				//TODO: Order these based on the config data (config.informationPanel.bars.stats)
				if (data && !(isNaN(data[stat]))) {
					h=data[stat]*scale;
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
		}//end if bars		
		//If text is set to display, display any text
		if (textStats.length>0) {
			var text ="<ul>";
			//var labels=config.informationPanel.text.labels;
			//var stats=config.informationPanel.text.stats;
			for (var i=0; i<textStats.length; i++) {
				if (data[textStats[i]["stat"]])
					text+="<li><span class=\"label\">"+textStats[i]["label"]+"</span>" + data[textStats[i]["stat"]]+"</li>";
			}
			$("#attributeText").html(text+"</ul>");
		}
		
	}
	
	
	
	function changeMainStat(stat) {
		//console.log("changeMainStat: " + stat);
		currentStat=stat;
		updateLegend();
	
	
		for (var country in image.shapes) {
			var obj = map.getById(country);
			if (obj) {
				var exists=data[country] && !isNaN(data[country][stat]);
				obj.attr({
					fill: hex2rgb(exists ? scale2hex(data[country][stat]) : '#ccc', 'string'),	
				});
			}
		}
	}
	
	function updateLegend() {
		//console.log("updateLengend. currentStat is " + currentStat);
		//Legend
		var legend = config["features"]["legend_"+currentStat];
		//console.log(legend.legendtitle);
		$("#legendtitle").html(legend.legendtitle);
		if (legend.labels && legend.colors) {
			//<li><span class="colourblock" style="background-color: #e0e2e2"></span><span class="colourlabel">0 - 50%</span></li>
			var legendColors="";
			for(var i=0; i<legend.labels.length; i++) {
				var color=legend.colors[i];
				var label=legend.labels[i];
				legendColors+="<li><span class=\"colourblock\" style=\"background-color: "+color+"\"></span><span class=\"colourlabel\">"+label+"</span>\n";
			}
			$("#legendColors").html(legendColors);
		}
	}

	
	// initialize
	$(window).resize();
	svg.animate({'opacity': 1}, 500);

});//End JSON Data load
});//End JSON Config load

});
