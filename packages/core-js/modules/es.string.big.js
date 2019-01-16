'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('big');

// `String.prototype.big` method
// https://tc39.github.io/ecma262/#sec-string.prototype.big
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  big: function big() {
    return createHTML(this, 'big', '', '');
  }
});
