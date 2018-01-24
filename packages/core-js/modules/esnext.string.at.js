'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $at = require('./_string-at')(true);

require('./_export')({ target: 'String', proto: true }, {
  at: function at(pos) {
    return $at(this, pos);
  }
});
