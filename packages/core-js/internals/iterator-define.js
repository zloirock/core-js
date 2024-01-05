'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var setPrototypeOf = require('../internals/object-set-prototype-of-simple');
var setToStringTag = require('../internals/set-to-string-tag');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IteratorsCore = require('../internals/iterators-core');

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var getPrototypeOf = Object.getPrototypeOf;

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var CurrentIteratorPrototype;

  // fix native
  if (nativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(nativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, NAME + ' Iterator', true, true);
    }
  }

  var methods = {
    values: getIterationMethod(VALUES),
    keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
    entries: getIterationMethod(ENTRIES),
  };

  if (FORCED) {
    Object.keys(methods).forEach(function (key) {
      if (BUGGY_SAFARI_ITERATORS || !(key in IterablePrototype)) {
        defineBuiltIn(IterablePrototype, key, methods[key]);
      }
    });
  } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS }, methods);

  // define iterator
  if (IterablePrototype[ITERATOR] !== defaultIterator) {
    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
  }
};
