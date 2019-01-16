'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('strike');

// `String.prototype.strike` method
// https://tc39.github.io/ecma262/#sec-string.prototype.strike
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  strike: function strike() {
    return createHTML(this, 'strike', '', '');
  }
});
