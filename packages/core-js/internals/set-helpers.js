'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

// dependency: es.set.constructor
// eslint-disable-next-line es/no-set -- safe
var SetPrototype = Set.prototype;

module.exports = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  add: uncurryThis(SetPrototype.add),
  has: uncurryThis(SetPrototype.has),
  remove: uncurryThis(SetPrototype.delete),
  proto: SetPrototype,
};
