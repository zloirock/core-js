'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aDataView = require('../internals/a-data-view');
var toIndex = require('../internals/to-index');
var DATA_VIEW_INT8_CONVERSION_BUG = require('../internals/data-view-int8-conversion-bug');

var $setInt8 = uncurryThis(DataView.prototype.setInt8);

// `DataView.prototype.setInt8` method
// https://github.com/tc39/proposal-dataview-get-set-int8clamped
$({ target: 'DataView', proto: true, unsafe: true, forced: DATA_VIEW_INT8_CONVERSION_BUG }, {
  setInt8: function setInt8(byteOffset, value) {
    return $setInt8(aDataView(this), toIndex(byteOffset), value << 24 >> 24);
  },
});
