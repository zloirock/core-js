'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var internalAt = require('../internals/string-at')(true);

require('../internals/export')({ target: 'String', proto: true }, {
  at: function at(pos) {
    return internalAt(this, pos);
  }
});
