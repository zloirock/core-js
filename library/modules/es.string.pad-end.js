'use strict';
// 21.1.3.13 String.prototype.padEnd(maxLength [ , fillString ])
var $export = require('./_export');
var $pad = require('./_string-pad');

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
