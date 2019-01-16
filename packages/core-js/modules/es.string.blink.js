'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('blink');

// `String.prototype.blink` method
// https://tc39.github.io/ecma262/#sec-string.prototype.blink
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  blink: function blink() {
    return createHTML(this, 'blink', '', '');
  }
});
