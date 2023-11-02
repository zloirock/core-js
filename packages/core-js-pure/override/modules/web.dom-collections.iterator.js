'use strict';
var globalThis = require('../internals/global-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var setToStringTag = require('../internals/set-to-string-tag');
var DOMIterables = require('../internals/dom-iterables');
var Iterators = require('../internals/iterators');

// dependency: es.array.iterator
var ArrayValues = getBuiltInPrototypeMethod('Array', 'values');

for (var COLLECTION_NAME in DOMIterables) {
  setToStringTag(globalThis[COLLECTION_NAME], COLLECTION_NAME);
  Iterators[COLLECTION_NAME] = ArrayValues;
}
