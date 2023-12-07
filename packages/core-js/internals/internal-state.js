'use strict';
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var shared = require('../internals/shared-store');

var TypeError = global.TypeError;
var WeakMap = global.WeakMap;

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
  return store.get(it) || {};
};

var has = function (it) {
  return store.has(it);
};

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
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
