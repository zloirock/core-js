'use strict';
var $at = require('./_string-at')(false);

require('./_export')({ target: 'String', proto: true }, {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});
