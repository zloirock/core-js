'use strict';
var IS_PURE = require('../internals/is-pure');
var IteratorsCore = require('../internals/iterators-core');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var setToStringTag = require('../internals/set-to-string-tag');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var getPrototypeOf = Object.getPrototypeOf;

module.exports = function (Iterable, ITERABLE_NAME, name) {
  var iterable = new Iterable();
  var method = iterable[name || ITERATOR];
  if (!method) return;
  var CurrentIteratorPrototype = getPrototypeOf(method.call(iterable));
  if (CurrentIteratorPrototype === Object.prototype) return;
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in CurrentIteratorPrototype)) return;
  if (IS_PURE) {
    if (!CurrentIteratorPrototype[ITERATOR]) return;
  // Ensure `%IteratorPrototype%` in the prototype chain
  } else if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
    setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
  }
  // Ensure proper `@@toStringTag`
  setToStringTag(CurrentIteratorPrototype, ITERABLE_NAME + ' Iterator', true, true);
  return method;
};
