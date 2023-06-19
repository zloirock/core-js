'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-typed-arrays -- safe
var getUint8 = uncurryThis(DataView.prototype.getUint8);

// `DataView.prototype.getUint8C` method
// https://github.com/ljharb/proposal-dataview-get-set-uint8c
$({ target: 'DataView', proto: true, forced: true }, {
  getUint8C: function getUint8C(byteOffset) {
    return getUint8(this, byteOffset);
  }
});
