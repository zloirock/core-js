'use strict';
var globalThis = require('../internals/global-this');
var isObject = require('../internals/is-object');
var shared = require('../internals/shared-store');

var TypeError = globalThis.TypeError;
var WeakMap = globalThis.WeakMap;
var create = Object.create;

var store = shared.state || (shared.state = new WeakMap());
/* eslint-disable no-self-assign -- prototype methods protection */
store.get = store.get;
store.has = store.has;
store.set = store.set;
/* eslint-enable no-self-assign -- prototype methods protection */
var set = function (it, metadata) {
  if (store.has(it)) throw new TypeError('Object already initialized');
  metadata.facade = it;
  store.set(it, metadata);
  return metadata;
};

var get = function (it) {
  return store.get(it) || create(null);
};

var has = store.has.bind(store);

var enforce = function (it) {
  return has(it) ? get(it) : set(it, create(null));
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor,
};
