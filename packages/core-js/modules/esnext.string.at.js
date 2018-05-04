'use strict';
var internalAt = require('../internals/string-at')(true);

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
require('../internals/export')({ target: 'String', proto: true }, {
  at: function at(pos) {
    return internalAt(this, pos);
  }
});
