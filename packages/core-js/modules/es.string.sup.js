'use strict';
var createHTML = require('../internals/create-html');
var FORCED = require('../internals/forced-string-html-method')('sup');

// `String.prototype.sup` method
// https://tc39.github.io/ecma262/#sec-string.prototype.sup
require('../internals/export')({ target: 'String', proto: true, forced: FORCED }, {
  sup: function sup() {
    return createHTML(this, 'sup', '', '');
  }
});
