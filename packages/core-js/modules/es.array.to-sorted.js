// types: proposals/change-array-by-copy
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');
var toObject = require('../internals/to-object');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var addToUnscopables = require('../internals/add-to-unscopables');

var $Array = Array;
// @dependency: es.array.sort
var sort = uncurryThis(getBuiltInPrototypeMethod('Array', 'sort'));

// `Array.prototype.toSorted` method
// https://tc39.es/ecma262/#sec-array.prototype.tosorted
$({ target: 'Array', proto: true }, {
  toSorted: function toSorted(compareFn) {
    if (compareFn !== undefined) aCallable(compareFn);
    var O = toObject(this);
    var A = arrayFromConstructorAndList($Array, O);
    return sort(A, compareFn);
  },
});

addToUnscopables('toSorted');
