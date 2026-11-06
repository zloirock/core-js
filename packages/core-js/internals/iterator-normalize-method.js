'use strict';
var IS_PURE = require('../internals/is-pure');
var fails = require('../internals/fails');
var IteratorPrototype = require('../internals/iterator-prototype');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var setToStringTag = require('../internals/set-to-string-tag');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

var getPrototypeOf = Object.getPrototypeOf;

module.exports = function (Iterable, ITERABLE_NAME, name) {
  var iterable = new Iterable();
  var method = iterable[name || ITERATOR];
  if (!method) return;
  var iterator = method.call(iterable);
  var CurrentIteratorPrototype = getPrototypeOf(iterator);
  if (CurrentIteratorPrototype === Object.prototype) return;
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in CurrentIteratorPrototype)) return;
  // FF26- iterators follow the legacy protocol: `next` returns bare values and throws `StopIteration` at the end
  if (fails(function () { return iterator.next().done !== true; })) return;
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
