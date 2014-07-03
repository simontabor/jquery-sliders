/**
@license jQuery Sliders v1.0.0
Copyright 2014 Simon Tabor - MIT License
https://github.com/simontabor/jquery-sliders / http://simontabor.com/labs/sliders
*/

(function(root) {

  var factory = function($) {

    <<Sliders>>

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
