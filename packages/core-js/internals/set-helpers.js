'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// @dependency: es.set.constructor
var SetPrototype = Set.prototype;

module.exports = {
  Set: Set,
  add: uncurryThis(SetPrototype.add),
  has: uncurryThis(SetPrototype.has),
  remove: uncurryThis(SetPrototype.delete),
  proto: SetPrototype,
};
