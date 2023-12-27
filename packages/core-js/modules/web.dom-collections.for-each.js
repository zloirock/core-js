'use strict';
var globalThis = require('../internals/global-this');
var getBuiltInPrototypeMethod = require('../internals/get-built-in-prototype-method');
var DOMIterables = require('../internals/dom-iterables');
var DOMTokenListPrototype = require('../internals/dom-token-list-prototype');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');

var forEach = getBuiltInPrototypeMethod('Array', 'forEach');

var handlePrototype = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
};

Object.keys(DOMIterables).forEach(function (collectionName) {
  handlePrototype(DOMIterables[collectionName] && globalThis[collectionName] && globalThis[collectionName].prototype);
});

handlePrototype(DOMTokenListPrototype);
