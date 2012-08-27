/*jshint node:true jquery:true */
/*global Modernizr:false */
"use strict";

var clayer = {};

clayer.setCss3 = function($element, name, value, addBrowserToValue) {
	addBrowserToValue = addBrowserToValue || false;
	var browsers = ['', '-ms-', '-moz-', '-webkit-', '-o-'];
	for (var i=0; i<browsers.length; i++) {
		var cssName = browsers[i] + name;
		var cssValue = (addBrowserToValue ? browsers[i] : '') + value;
		$element.css(cssName, cssValue);
	}
};

clayer.isTouch = ('ontouchstart' in document.documentElement);
clayer.initTouchElements = function($element) {
	$element.find('.clayer-touch').toggle(clayer.isTouch);
	$element.find('.clayer-mouse').toggle(!clayer.isTouch);
};

clayer.Touchable = function() { return this.init.apply(this, arguments); };
clayer.Touchable.prototype = {
	init: function($element, delegate) {
		this.$element = $element;
		this.$document = $($element[0].ownerDocument);
		this.delegate = delegate;

		this.mouseDown = $.proxy(this.mouseDown, this);
		this.mouseMove = $.proxy(this.mouseMove, this);
		this.mouseUp = $.proxy(this.mouseUp, this);
		this.touchStart = $.proxy(this.touchStart, this);
		this.touchMove = $.proxy(this.touchMove, this);
		this.touchEnd = $.proxy(this.touchEnd, this);
		this.hoverMove = $.proxy(this.hoverMove, this);
		this.hoverLeave = $.proxy(this.hoverLeave, this);

		this.documentEvents = {
			mousemove: this.mouseMove,
			mouseup: this.mouseUp,
			touchmove: this.touchMove,
			touchend: this.touchEnd,
			touchcancel: this.touchEnd
		};

		this.setTouchable(false);
		this.setHoverable(false);
	},

	setTouchable: function(isTouchable) {
		if (this.isTouchable === isTouchable) return;
		this.isTouchable = isTouchable;
		this.touchEvent = null;

		if (isTouchable) {
			this.$element.on({
				mousedown: this.mouseDown,
				touchstart: this.touchStart
			});
		}
		else {
			this.$element.off('mousedown touchstart');
			this.$document.off(this.documentEvents);
			// CSS3 "pointer-events: none" here? (not supported by IE)
		}
	},

	setHoverable: function(isHoverable) {
		if (this.isHoverable === isHoverable) return;
		this.isHoverable = isHoverable;
		this.hoverEvent = null;

		if (isHoverable) {
			this.$element.on({
				mousemove: this.hoverMove,
				mouseleave: this.hoverLeave
			});
		}
		else {
			this.$element.off({
				mousemove: this.hoverMove,
				mouseleave: this.hoverLeave
			});
			// CSS3 "pointer-events: none" here? (not supported by IE)
		}
	},

	mouseDown: function(event) {
		if (this.isTouchable) {
			this.$document.on({
				mousemove: this.mouseMove,
				mouseup: this.mouseUp
			});
			
			this.touchEvent = new clayer.PositionEvent(this.$element, event, event.timeStamp, true);
			this.delegate.touchDown(this.touchEvent);
		}
		return false;
	},

	mouseMove: function(event) {
		if (this.isTouchable && this.touchEvent) {
			this.touchEvent.move(event, event.timeStamp);
			this.delegate.touchMove(this.touchEvent);
		}
		return false;
	},

	mouseUp: function(event) {
		if (this.isTouchable && this.touchEvent) {
			this.touchEvent.up(event, event.timeStamp);
			this.delegate.touchUp(this.touchEvent);
			this.touchEvent = null;
		}
		this.$document.off(this.documentEvents);
		return false;
	},

	touchStart: function(event) {
		this.$element.off({
			'mousedown': this.mouseDown,
			'mousemove': this.hoverMove,
			'mouseleave': this.hoverLeave
		}); // we're on a touch device (safer than checking using clayer.isTouch)

		if (!this.isTouchable || this.touchEvent || event.originalEvent.targetTouches.length > 1) {
			this.touchEnd(event);
		} else {
			this.$document.on({
				touchmove: this.touchMove,
				touchend: this.touchEnd,
				touchcancel: this.touchEnd
			});
		
			this.touchEvent = new clayer.PositionEvent(this.$element, event.originalEvent.targetTouches[0], event.timeStamp, false);
			this.delegate.touchDown(this.touchEvent);
		}
		return false;
	},

	touchMove: function(event) {
		if (this.isTouchable && this.touchEvent) {
			var touchEvent = this.findTouchEvent(event.originalEvent.touches);
			if (touchEvent === null) {
				this.touchEnd(event);
			} else {
				this.touchEvent.move(touchEvent, event.timeStamp);
				this.delegate.touchMove(this.touchEvent);
			}
		}
		return false;
	},

	touchEnd: function(event) {
		if (this.isTouchable && this.touchEvent) {
			this.touchEvent.up(this.findTouchEvent(event.originalEvent.touches), event.timeStamp);
			this.delegate.touchUp(this.touchEvent);
			this.touchEvent = null;
		}
		this.$document.off(this.documentEvents);
		return false;
	},

	hoverMove: function(event) {
		if (this.touchEvent) {
			this.mouseMove(event);
		} else if (this.isHoverable) {
			if (!this.hoverEvent) {
				this.hoverEvent = new clayer.PositionEvent(this.$element, event, true);
			} else {
				this.hoverEvent.move(event, event.timeStamp);
			}
			this.delegate.hoverMove(this.hoverEvent);
		}
		return false;
	},

	hoverLeave: function(event) {
		if (this.isHoverable && this.hoverEvent) {
			this.hoverEvent.move(event);
			this.delegate.hoverLeave(this.hoverEvent);
			this.hoverEvent = null;
		}
		return false;
	},

	findTouchEvent: function(touches) {
		for (var i=0; i<touches.length; i++) {
			if (touches[i].identifier === this.touchEvent.event.identifier) {
				return touches[i];
			}
		}
		return null;
	}
};

clayer.PositionEvent = function() { return this.init.apply(this, arguments); };
clayer.PositionEvent.prototype = {
	init: function($element, event, timestamp, mouse) {
		this.$element = $element;
		this.globalPoint = { x: event.pageX, y: event.pageY };
		this.translation = { x:0, y:0 };
		this.deltaTranslation = { x:0, y:0 };
		this.localPoint = { x:0, y:0 };
		this.updateLocalPoint();

		this.event = event;
		this.startTimestamp = this.timestamp = timestamp;
		this.hasMoved = false;
		this.wasTap = false;
		this.mouse = mouse;
	},

	move: function(event, timestamp) {
		this.event = event;
		this.timestamp = timestamp;
		this.updatePositions();
	},

	up: function(event, timestamp) {
		this.event = event || this.event;
		this.timestamp = timestamp;
		this.wasTap = !this.hasMoved && (this.getTimeSinceGoingDown() < 300);
	},

	getTimeSinceGoingDown: function () {
		return this.timestamp - this.startTimestamp;
	},

	resetDeltaTranslation: function() {
		this.deltaTranslation.x = 0;
		this.deltaTranslation.y = 0;
	},

	updatePositions: function() {
		var dx = this.event.pageX - this.globalPoint.x;
		var dy = this.event.pageY - this.globalPoint.y;
		this.translation.x += dx;
		this.translation.y += dy;
		this.deltaTranslation.x += dx;
		this.deltaTranslation.y += dy;
		this.globalPoint.x = this.event.pageX;
		this.globalPoint.y = this.event.pageY;
		this.updateLocalPoint();

		if (this.translation.x*this.translation.x + this.translation.y*this.translation.y > 200) this.hasMoved = true;
	},

	updateLocalPoint: function() {
		var offset = this.$element.offset();
		this.localPoint.x = this.globalPoint.x - offset.left;
		this.localPoint.y = this.globalPoint.y - offset.top;
	},

	inElement: function() {
		return this.localPoint.x >= 0 && this.localPoint.x <= this.$element.outerWidth() &&
			this.localPoint.y >= 0 && this.localPoint.y <= this.$element.outerHeight();
	}
};

clayer.Scrubbable = function() { return this.init.apply(this, arguments); };
clayer.Scrubbable.prototype = {
	init: function($element, delegate) {
		this.$element = $element;
		this.delegate = delegate;
		this.touchable = new clayer.Touchable($element, this);
		this.setScrubbable(true);
	},

	setScrubbable: function(value) {
		this.touchable.setTouchable(value);
		this.touchable.setHoverable(value);
	},

	hoverMove: function(event) {
		this.delegate.scrubMove(event.localPoint.x, event.localPoint.y, false);
	},

	hoverLeave: function(event) {
		this.delegate.scrubLeave();
	},

	touchDown: function(event) {
		this.touchMove(event);
	},

	touchMove: function(event) {
		this.delegate.scrubMove(event.localPoint.x, event.localPoint.y, true);
	},

	touchUp: function(event) {
		if (event.wasTap) {
			this.delegate.scrubClick();
		}
		if (!event.mouse || !event.inElement()) {
			this.delegate.scrubLeave();
		}
	}
};

clayer.Slider = function() { return this.init.apply(this, arguments); };
clayer.Slider.prototype = {
	init: function($element, delegate, valueWidth) {
		this.$element = $element;
		this.$element.addClass('clayer-slider');
		this.delegate = delegate;

		this.valueWidth = valueWidth || 1;
		this.markerValue = 0;
		this.knobValue = 0;

		this.$container = $('<div class="clayer-slider-container"></div>');
		this.$element.append(this.$container);

		this.$bar = $('<div class="clayer-slider-bar"></div>');
		this.$container.append(this.$bar);

		this.$segmentContainer = $('<div class="clayer-slider-segment-container"></div>');
		this.$bar.append(this.$segmentContainer);

		this.$marker = $('<div class="clayer-slider-marker"></div>');
		this.markerWidth = Math.min(this.valueWidth, 10);
		this.$marker.width(this.markerWidth);
		this.$bar.append(this.$marker);

		this.$knob = $('<div class="clayer-slider-knob"></div>');
		this.$container.append(this.$knob);

		this.scrubbable = new clayer.Scrubbable(this.$element, this);

		this.bounceTimer = null;

		this.renderKnob();
		this.renderMarker();
	},

	remove: function() {
		this.scrubbable.setScrubbable(false);
		this.$segmentContainer.remove();
		this.$marker.remove();
		this.$knob.remove();
		this.$bar.remove();
		this.$container.remove();
	},

	setSegments: function(ranges) {
		this.$segmentContainer.html('');
		for (var i=0; i<ranges.length; i++) {
			var range = ranges[i];
			var $segment = $('<div class="clayer-slider-segment"></div>');
			this.$segmentContainer.append($segment);

			$segment.css('left', range.start*this.valueWidth);
			$segment.width((range.end - range.start + 1)*this.valueWidth);
			$segment.css('background-color', range.color);
		}
	},

	setValue: function(value) {
		this.markerValue = this.knobValue = value;
		this.renderKnob();
		this.renderMarker();
	},

	setKnobValue: function(value) {
		this.knobValue = value;
		this.renderKnob();
	},

	changed: function(down) {
		this.delegate.sliderChanged(this.knobValue, down);
	},

	updateKnob: function(x) {
		x = Math.max(0, Math.min(this.$element.width()-1, x));
		this.updateKnobValue(Math.floor(x/this.valueWidth));
	},

	updateKnobValue: function(knobValue) {
		if (this.knobValue !== knobValue) {
			this.knobValue = knobValue;
			this.renderKnob();
			this.changed(false);
		}
	},

	updateMarker: function(x) {
		x = Math.max(0, Math.min(this.$element.width()-1, x));
		var markerValue = Math.floor(x/this.valueWidth);
		if (this.markerValue !== markerValue) {
			this.knobValue = this.markerValue = markerValue;
			this.renderKnob();
			this.renderMarker();
			this.changed(true);
		}
	},

	renderKnob: function() {
		this.$knob.css('left', (this.knobValue+0.5)*this.valueWidth);

		if (this.bounceTimer !== null) {
			this.bounceProgress = Math.min(this.bounceProgress + 0.04, 1);
			var p = this.bounceProgress;
			var jumpY = (p < 0.5) ? (15*(1-Math.pow(4*p-1, 2))) : (4*(1-Math.pow(4*(p-0.5)-1, 2)));
			this.$knob.css('top', -jumpY);
			if (this.bounceProgress >= 1) {
				clearInterval(this.bounceTimer);
				this.bounceTimer = null;
			}
		}
	},

	renderMarker: function() {
		this.$marker.css('left', (this.markerValue+0.5)*this.valueWidth - this.markerWidth/2);
	},

	scrubMove: function(x, y, down) {
		if (down) {
			this.updateMarker(x);
		} else {
			this.updateKnob(x);
		}
	},

	scrubLeave: function() {
		this.updateKnobValue(this.markerValue);
	},

	scrubClick: function() {
		if (this.bounceTimer === null) {
			this.bounceTimer = setInterval($.proxy(this.renderKnob, this), 20);
			this.bounceProgress = 0;
		}
	}
};

module.exports = clayer;
