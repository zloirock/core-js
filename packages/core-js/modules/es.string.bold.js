'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('bold');

// `String.prototype.bold` method
// https://tc39.github.io/ecma262/#sec-string.prototype.bold
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  bold: function bold() {
    return createHTML(this, 'b', '', '');
  }
});
