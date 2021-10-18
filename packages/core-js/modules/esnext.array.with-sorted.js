'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');
var toIndexedObject = require('../internals/to-indexed-object');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var getVirtual = require('../internals/entry-virtual');
var addToUnscopables = require('../internals/add-to-unscopables');

var sort = uncurryThis(getVirtual('Array').sort);

// `Array.prototype.withSorted` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.withSorted
$({ target: 'Array', proto: true }, {
  withSorted: function withSorted(compareFn) {
    if (compareFn !== undefined) aCallable(compareFn);
    var O = toIndexedObject(this);
    var A = arrayFromConstructorAndList(Array, O);
    return sort(A, compareFn);
  }
});

addToUnscopables('withSorted');
