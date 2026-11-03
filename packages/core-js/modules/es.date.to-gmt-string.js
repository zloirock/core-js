'use strict';
var $ = require('../internals/export');

// `Date.prototype.toGMTString` method
// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
$({ target: 'Date', proto: true, name: 'toUTCString' }, {
  toGMTString: Date.prototype.toUTCString
});
