'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('sub');

// `String.prototype.sub` method
// https://tc39.github.io/ecma262/#sec-string.prototype.sub
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  sub: function sub() {
    return createHTML(this, 'sub', '', '');
  }
});
