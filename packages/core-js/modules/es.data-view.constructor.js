'use strict';
var setPrototypeOf = require('../internals/object-set-prototype-of');

var $DataView = DataView;
var DataViewPrototype = $DataView.prototype;
var ObjectPrototype = Object.prototype;
var getPrototypeOf = Object.getPrototypeOf;

// WebKit bug - the same parent prototype for typed arrays and data view
if (getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}
