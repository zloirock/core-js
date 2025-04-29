// types: proposals/data-view-get-set-uint8-clamped
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aDataView = require('../internals/a-data-view');
var toIndex = require('../internals/to-index');

var floor = Math.floor;
var setUint8 = uncurryThis(DataView.prototype.setUint8);

// https://tc39.es/ecma262/#sec-touint8clamp
var toUint8Clam = function (it) {
  var number = +it;
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number !== number || number <= 0) return 0;
  if (number >= 0xFF) return 0xFF;
  var f = floor(number);
  if (f + 0.5 < number) return f + 1;
  if (number < f + 0.5) return f;
  // round-half-to-even (banker's rounding)
  return f % 2 === 0 ? f : f + 1;
};

// `DataView.prototype.setUint8Clamped` method
// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
$({ target: 'DataView', proto: true, forced: true }, {
  setUint8Clamped: function setUint8Clamped(byteOffset, value) {
    return setUint8(aDataView(this), toIndex(byteOffset), toUint8Clam(value));
  },
});
