'use strict';
var globalThis = require('../internals/global-this');
var getIteratorMethod = require('../internals/get-iterator-method');
var setToStringTag = require('../internals/set-to-string-tag');
var DOMIterables = require('../internals/dom-iterables');
var Iterators = require('../internals/iterators');

// dependency: es.array.iterator
var ArrayValues = getIteratorMethod([]);

Object.keys(DOMIterables).forEach(function (collectionName) {
  setToStringTag(globalThis[collectionName], collectionName);
  Iterators[collectionName] = ArrayValues;
});
