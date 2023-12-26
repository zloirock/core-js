'use strict';
var globalThis = require('../internals/global-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var DOMIterables = require('../internals/dom-iterables');
var DOMTokenListPrototype = require('../internals/dom-token-list-prototype');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var setToStringTag = require('../internals/set-to-string-tag');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
// dependency: es.array.iterator
var ArrayValues = getBuiltInPrototypeMethod('Array', 'values');

var handlePrototype = function (CollectionPrototype, collectionName) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    setToStringTag(CollectionPrototype, collectionName, true);
    if (DOMIterables[collectionName]) ['entries', 'keys', 'values'].forEach(function (methodName) {
      // dependency: es.array.iterator
      var method = getBuiltInPrototypeMethod('Array', methodName);
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[methodName] !== method) try {
        createNonEnumerableProperty(CollectionPrototype, methodName, method);
      } catch (error) {
        CollectionPrototype[methodName] = method;
      }
    });
  }
};

Object.keys(DOMIterables).forEach(function (collectionName) {
  handlePrototype(globalThis[collectionName] && globalThis[collectionName].prototype, collectionName);
});

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');
