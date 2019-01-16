'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('italics');

// `String.prototype.italics` method
// https://tc39.github.io/ecma262/#sec-string.prototype.italics
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  italics: function italics() {
    return createHTML(this, 'i', '', '');
  }
});
