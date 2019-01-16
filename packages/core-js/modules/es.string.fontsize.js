'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('fontsize');

// `String.prototype.fontsize` method
// https://tc39.github.io/ecma262/#sec-string.prototype.fontsize
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  fontsize: function fontsize(size) {
    return createHTML(this, 'font', 'size', size);
  }
});
