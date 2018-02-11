'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $at = require('../internals/string-at')(true);

require('../internals/export')({ target: 'String', proto: true }, {
  at: function at(pos) {
    return $at(this, pos);
  }
});
