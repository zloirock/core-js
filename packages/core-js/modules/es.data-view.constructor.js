'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var defineBuiltIns = require('../internals/define-built-ins');
var aDataView = require('../internals/a-data-view');
var toIndex = require('../internals/to-index');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');

var $DataView = DataView;
var DataViewPrototype = $DataView.prototype;
var ObjectPrototype = Object.prototype;
var getPrototypeOf = Object.getPrototypeOf;
var $setInt8 = uncurryThis(DataViewPrototype.setInt8);

// WebKit bug - the same parent prototype for typed arrays and data view
if (getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}

// iOS Safari 7.x bug
var testView = new $DataView(new ArrayBuffer(2));
testView.setInt8(0, 2147483648);
testView.setInt8(1, 2147483649);
if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns(DataViewPrototype, {
  setInt8: function setInt8(byteOffset, value) {
    $setInt8(aDataView(this), toIndex(byteOffset), value << 24 >> 24);
  },
  setUint8: function setUint8(byteOffset, value) {
    $setInt8(aDataView(this), toIndex(byteOffset), value << 24 >> 24);
  },
}, { unsafe: true });

setToStringTag($DataView, 'DataView');
