'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('fontcolor');

// `String.prototype.fontcolor` method
// https://tc39.github.io/ecma262/#sec-string.prototype.fontcolor
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  fontcolor: function fontcolor(color) {
    return createHTML(this, 'font', 'color', color);
  }
});
