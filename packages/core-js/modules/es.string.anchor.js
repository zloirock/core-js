'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('anchor');

// `String.prototype.anchor` method
// https://tc39.github.io/ecma262/#sec-string.prototype.anchor
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  anchor: function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  }
});
