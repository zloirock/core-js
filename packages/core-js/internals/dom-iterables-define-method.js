'use strict';
var globalThis = require('../internals/global-this');
var DOMIterables = require('../internals/dom-iterables');
var DOMTokenListPrototype = require('../internals/dom-token-list-prototype');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

var handlePrototype = function (CollectionPrototype, key, method) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype[key] !== method) try {
    createNonEnumerableProperty(CollectionPrototype, key, method);
  } catch (error) {
    CollectionPrototype[key] = method;
  }
};

module.exports = function (key, method, iterableInterfaceOnly) {
  Object.keys(DOMIterables).forEach(function (collectionName) {
    if (!iterableInterfaceOnly || DOMIterables[collectionName]) {
      handlePrototype(globalThis[collectionName] && globalThis[collectionName].prototype, key, method);
    }
  });

  handlePrototype(DOMTokenListPrototype, key, method);
};
