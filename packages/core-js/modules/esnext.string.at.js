'use strict';
var codePointAt = require('../internals/string-at');

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
require('../internals/export')({ target: 'String', proto: true }, {
  at: function at(pos) {
    return codePointAt(this, pos, true);
  }
});
