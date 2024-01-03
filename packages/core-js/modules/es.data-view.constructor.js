'use strict';
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');

var DataViewPrototype = DataView.prototype;
var ObjectPrototype = Object.prototype;

// WebKit bug - the same parent prototype for typed arrays and data view
if (Object.getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
  setPrototypeOf(DataViewPrototype, ObjectPrototype);
}
