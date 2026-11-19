// @types: proposals/array-buffer-transfer
'use strict';
var $ = require('../internals/export');
var $transfer = require('../internals/array-buffer-transfer');
var FORCED = require('../internals/array-buffer-transfer-forced');

// `ArrayBuffer.prototype.transfer` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.transfer
if ($transfer) $({ target: 'ArrayBuffer', proto: true, forced: FORCED }, {
  transfer: function transfer() {
    return $transfer(this, arguments.length ? arguments[0] : undefined, true);
  },
});
