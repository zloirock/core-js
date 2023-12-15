'use strict';
var collection = require('../internals/collection');
var collectionWeak = require('../internals/collection-weak');
var IS_IE11 = require('../internals/environment-is-ie11');
var WEAK_COLLECTIONS_UNFREEZING_BUG = require('../internals/weak-collections-unfreezing-bug');

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
collection('WeakMap', function (init) {
  return function WeakMap() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionWeak, IS_IE11 || WEAK_COLLECTIONS_UNFREEZING_BUG);
