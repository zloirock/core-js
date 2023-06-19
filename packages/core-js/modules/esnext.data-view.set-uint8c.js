'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var classof = require('../internals/classof');
var toIndex = require('../internals/to-index');
var toUint8C = require('../internals/to-uint8c');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-typed-arrays -- safe
var setUint8 = uncurryThis(DataView.prototype.setUint8);

// `DataView.prototype.setUint8C` method
// https://github.com/ljharb/proposal-dataview-get-set-uint8c
$({ target: 'DataView', proto: true, forced: true }, {
  setUint8C: function setUint8C(byteOffset, value) {
    if (classof(this) !== 'DataView') throw $TypeError('Incorrect receiver');
    var offset = toIndex(byteOffset);
    return setUint8(this, offset, toUint8C(value));
  }
});
