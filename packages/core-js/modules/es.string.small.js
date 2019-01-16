'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('small');

// `String.prototype.small` method
// https://tc39.github.io/ecma262/#sec-string.prototype.small
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  small: function small() {
    return createHTML(this, 'small', '', '');
  }
});
