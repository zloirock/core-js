'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('fixed');

// `String.prototype.fixed` method
// https://tc39.github.io/ecma262/#sec-string.prototype.fixed
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  fixed: function fixed() {
    return createHTML(this, 'tt', '', '');
  }
});
