(function($) {
	window.resodo = {
		'setup': function(){

			// Scan document for elements with resodo data
			resodo.scan();

			// Setup breakpoint events
			resodo.breakPoints = $.extend(resodo.breakPoints, siteBreakPoints);

			$(window).resize(function () {
				resodo.breakPointEvents();
			}).resize();

		},
		'breakPoints': [],
		'reorder': function(breakPoint, element, order) {
			// Fancy reordering
			$(document).on('breakpoint-'+breakPoint, function() {

			});

		},
		'rename': function(breakPoint, element, rename) {
			$(document).on('breakpoint-'+breakPoint, function(){
				if(breakPoint == 'small-down' || breakPoint == 'small-up'){
					console.log('here');
				}

				if(!element.hasClass(rename.to) && element.hasClass(rename.from)) {
					element.removeClass(rename.from).addClass(rename.to);
				}
			});
		},
		'renameToggle': function(breakPoint, element, toggle) {
			resodo.rename(breakPoint+'-up', element, {from: toggle.lower, to: toggle.upper});
			resodo.rename(breakPoint+'-down', element, {from: toggle.upper, to: toggle.lower});
		},
		'scan': function() {
			resodo.elements = $("[data-resodo]");
			resodo.elements.each(function(){
				var element = $(this),
					breakPointTasks;

				try {
					breakPointTasks = eval('({' + element.attr('data-resodo') + '})');
				} catch(e){
					console.log('Error: Check your syntax for the follow object\'s resodo data:');
					console.log(element);
					console.log("Data:"+element.attr('data-resodo'));
				}

				for(var breakPoint in breakPointTasks) {
					var tasks = breakPointTasks[breakPoint];

					for(var i = 0; i < tasks.length; i++) {
						var taskName = tasks[i].match(/[^\s|:]+/)[0],
							task = tasks[i].match(/(:[\s]+)(.+)/)[2],
							taskData;
						switch (taskName) {
							case 'reorder':
								resodo.reorder(breakPoint, element, taskData);
								break;
							case 'rename':
								taskData = {};
								taskData.from = task.match(/[^\s|=]+/)[0];
								taskData.to = task.match(/(=>[\s]+)(.*)+/)[2];

								resodo.rename(breakPoint, element, taskData);
								break;
							case 'renameToggle':
								taskData = {};
								taskData.lower = task.match(/[^\s|<]+/)[0];
								taskData.upper = task.match(/(<=>[\s]+)(.*)+/)[2];

								resodo.renameToggle(breakPoint, element, taskData);
								break;
						}
					}
				}

			});

		},
		'deviceWidth': function(){
			var device_width = $(window).width();
			var base_font = parseInt($('body').css('font-size'), 10),
				device_width = device_width / base_font; // CSS media queries use ems, so js break points must be in ems to match

			return device_width;
		},
		'breakPointEvents': function() {
			var deviceWidth = resodo.deviceWidth();
			for (var i = 0; i < resodo.breakPoints.length; i++) {
				// Make sure the active has been added to the breakpoint
				if(resodo.breakPoints[i].active == null) {
					resodo.breakPoints[i].active = {
						up: 0,
						down: 0,
						only: 0
					};
				}

				var breakPoint = resodo.breakPoints[i],
				nextBreakPoint = resodo.breakPoints[i+1];

				function loggerQ(){

					if(breakPoint.name == 'small') {
						//console.log(deviceWidth);
					}
				}

				if(deviceWidth <= breakPoint.width) {
					if(!breakPoint.active.down) {
						$(document).trigger('breakpoint-' + breakPoint.name + '-down');
						breakPoint.active.down = 1;
						// console.log('Generic breakpoint: '+'breakpoint-' + size+'-down');
					}
				} else {
					breakPoint.active.down = 0;
				}

				if(deviceWidth > breakPoint.width) {
					if(!breakPoint.active.up){
						$(document).trigger('breakpoint-' + breakPoint.name + '-up');
						breakPoint.active.up = 1;
						// console.log('Generic breakpoint: '+'breakpoint-' + size+'-up');
					}
				} else {
					breakPoint.active.up = 0;
				}

				if(nextBreakPoint != null && deviceWidth > breakPoint.width && deviceWidth <= nextBreakPoint.width) {
					if(!breakPoint.active.only) {
						$(document).trigger('breakpoint-' + breakPoint.name);
						breakPoint.active.only = 1;
					}
				} else {
					breakPoint.active.only = 0;
				}

			}
		}
	};

	// These should match values in the mediaQuery and size settings in SASS
	var siteBreakPoints = [
		{name:'super-small', width: 20},
		{name:'x-small', width: 48},
		{name:'small', width: 64},
		{name:'medium', width: 80},
		{name:'large', width: 85.375},
		{name:'x-large', width: 120}
	];

	// Automatically Setup once the document is ready!
	$(document).ready(function(){
		resodo.setup();
	});

}) (jQuery);