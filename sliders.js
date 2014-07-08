/**
@license jQuery Sliders v1.1.0
Copyright 2014 Simon Tabor - MIT License
https://github.com/simontabor/jquery-sliders / http://simontabor.com/labs/sliders
*/

(function(root) {

  var factory = function($) {

var Sliders = root['Sliders'] = function(el, opts) {
  var self = this;

  if (typeof opts === 'number' && el.data('sliders')) {
    el.data('sliders').setValue(opts);
    return;
  }

  var defaults = {
    // can the slider be dragged
    'drag': true,
    // can it be clicked to slide
    'click': true,
    // value for the slider on init
    'value': 0,
    // min + max states (inclusive)
    'min': 0,
    'max': 10,
    // step interval
    'step': 1,
    // animation time (ms)
    'animate': 250,
     // animation transition,
    'easing': 'swing',
    // width used if not set in css
    'width': 50,
    // height if not set in css
    'height': 20,
    // the event to fire once we've finished changing (e.g. click or drag released)
    'changeEvent': 'change',
    // the event to fire whilst we're moving between values (e.g. dragging through multiple bounds)
    'valueEvent': 'value',
    // input element to set the value of and inherit values off
    'input': false
  };

  var dataOpts = {};
  for (var i in defaults) {
    var opt = el.data('slider-' + i);
    if (typeof opt !== 'undefined') dataOpts[i] = opt;
  }

  // extend default opts with the users options
  self.opts = $.extend(defaults, opts || {}, dataOpts);

  self.input = self.opts['input'] && $(self.opts['input']);

  if (el[0].tagName === 'INPUT') {
    self.input = el.hide();
    el = $('<div>');
    el.insertAfter(self.input);
  }

  if (self.input) {
    var inputAttrs = [ 'max', 'min', 'step', 'value' ];
    var inputOpts = {};
    for (var i = 0; i < inputAttrs.length; i++) {
      var opt = self.input.attr(inputAttrs[i]);
      if (typeof opt !== 'undefined') inputOpts[i] = opt;
    }
    self.opts = $.extend(self.opts, inputOpts);
  }

  self.el = el;

  // ensure sliders.value is available
  self['value'] = self.opts['value'];

  el.data('sliders', self);

  self.id = Math.random().toString(36).slice(1);

  self.createEl();
  self.bindEvents();
  self.setRange(self.opts['min'], self.opts['max'], true);
};

Sliders.prototype.createEl = function() {
  var self = this;

  var height = self.el.height();
  var width = self.el.width();

  // if the element doesnt have an explicit height/width in css, set them
  if (!height) self.el.height(height = self.opts['height']);
  if (!width) self.el.width(width = self.opts['width']);

  self.h = height;
  self.w = width;

  var div = function(name) {
    return $('<div class="slider-' + name +'">');
  };

  self.els = {
    // wrapper inside toggle
    inner: div('inner'),

    // inside slide, this bit moves
    knob: div('knob'),

    // the track that the knob slides along
    track: div('track'),

    // the active part of the track, allowing for styling
    activeTrack: div('activeTrack')
  };

  self.els.activeKnob = self.els.activeTrack.add(self.els.knob);

  // construct the toggle
  self.els.track.html(self.els.activeTrack);
  self.els.inner.append(self.els.knob, self.els.track);
  self.el.html(self.els.inner);
};

Sliders.prototype.bindEvents = function() {
  var self = this;

  if (self.opts['click']) {
    self.el.on('click', function(e) {
      var off = self.el.offset();
      self.move((e.pageX - off.left) / self.w * 100);
      self.bound();
    });
  }

  // bind up dragging stuff
  if (self.opts['drag']) self.bindDrag();
};

Sliders.prototype.bindDrag = function() {
  var self = this;

  self.els.knob.on('mousedown', function(e) {
    var off = self.el.offset();

    // TODO is there any way we can set the dragging cursor everywhere here,
    // short of creating a fake overlay element that stays under the mouse?

    $(document).on('mousemove' + self.id, function(e) {
      self.move((e.pageX - off.left) / self.w * 100, true);
    });

    $(document).on('mouseup' + self.id, function() {
      $(document).unbind('mousemove' + self.id);
      $(document).unbind('mouseup' + self.id);
      self.bound()
    });
  });

  self.els.knob.on('touchstart', function(e) {
    var off = self.el.offset();

    self.els.knob.on('touchmove' + self.id, function(e) {
      var newX = e.originalEvent.touches[0].clientX;
      self.move((newX - off.left) / self.w * 100, true);
    });

    self.els.knob.on('touchend' + self.id, function(e) {
      self.els.knob.unbind('touchmove' + self.id);
      self.els.knob.unbind('touchend' + self.id);
      self.bound()
    });
  });
};

Sliders.prototype.move = function(across, noAnimate) {
  var self = this;
  if (across > 100) across = 100;
  if (across < 0) across = 0;

  // percentage across that we are
  self.across = across;

  var css = {
    'marginLeft': across * self.w / 100
  };

  if (!noAnimate) {
    self.els.activeKnob.stop().animate(css);
  } else {
    self.els.activeKnob.stop().css(css);
  }

  if (self.getBound() !== self['value']) self.el.trigger(self.opts['valueEvent'], self['value'] = self.getBound());
};

Sliders.prototype.getBound = function() {
  var self = this;
  var bound = Math.round(self.across / (100 / (self.max - self.min)) / self.opts['step']) * self.opts['step'] + self.min;
  if (bound < self.min) bound = self.min;
  if (bound > self.max) bound = self.max;
  return bound;
};

Sliders.prototype.bound = function() {
  var self = this;
  self.setValue(self.getBound());
};

Sliders.prototype.setValue = Sliders.prototype['setValue'] = function(lvl, noAnimate) {
  var self = this;

  self.move((lvl - self.min) * 100 / (self.max - self.min), noAnimate);

  if (lvl !== self.changeState) self.el.trigger(self.opts['changeEvent'], lvl);
  self['value'] = self.changeState = lvl;
  if (self.input) self.input.val(lvl);
};

Sliders.prototype.setRange = Sliders.prototype['setRange'] = function(min, max, noAnimate) {
  var self = this;
  if (typeof min !== 'undefined') self.min = min;
  if (typeof max !== 'undefined') self.max = max;

  if (self.input) {
    self.input.attr('min', self.min);
    self.input.attr('max', self.max);
  }

  self.setValue(self['value'], noAnimate);
};

    $.fn['sliders'] = function(opts) {
      return this.each(function() {
        new Sliders($(this), opts);
      });
    };
  };

  if (typeof define === 'function' && define['amd']) {
    define(['jquery'], factory);
  } else {
    factory(root['jQuery'] || root['Zepto'] || root['ender'] || root['$'] || $);
  }

})(this);
