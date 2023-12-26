'use strict';
var shared = require('../internals/shared-store');

var $TypeError = TypeError;
var create = Object.create;

var store = shared.state || (shared.state = new WeakMap());
/* eslint-disable no-self-assign -- prototype methods protection */
store.get = store.get;
store.has = store.has;
store.set = store.set;
/* eslint-enable no-self-assign -- prototype methods protection */
var set = function (it, metadata) {
  if (store.has(it)) throw new $TypeError('Object already initialized');
  metadata.facade = it;
  store.set(it, metadata);
  return metadata;
};

var get = function (it) {
  return store.get(it) || create(null);
};

var enforce = function (it) {
  return store.has(it) ? get(it) : set(it, create(null));
};

module.exports = {
  set: set,
  get: get,
  enforce: enforce,
};
