'use strict';
var getBuiltIn = require('../internals/get-built-in');
var caller = require('../internals/caller');

// dependency: es.set.constructor
var Set = getBuiltIn('Set');
var SetPrototype = Set.prototype;

module.exports = {
  Set: Set,
  add: caller('add', 1),
  has: caller('has', 1),
  remove: caller('delete', 1),
  proto: SetPrototype,
};
