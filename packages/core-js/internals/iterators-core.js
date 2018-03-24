'use strict';
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var hide = require('../internals/hide');
var has = require('../internals/has');
var IS_PURE = require('../internals/is-pure');
var ITERATOR = require('../internals/well-known-symbol')('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // old Safari has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);

var createIteratorConstructor = function (Constructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  Constructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(Constructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return Constructor;
};

var $export = require('../internals/export');
var redefine = require('../internals/redefine');
var Iterators = require('../internals/iterators');
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var defineIterator = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY_SAFARI_ITERATORS && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TO_STRING_TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorProto;
  // Fix native
  if ($anyNative) {
    IteratorProto = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorProto.next) { // we should replace it!!!
      if (!IS_PURE && getPrototypeOf(IteratorProto) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(IteratorProto, IteratorPrototype);
        } else if (typeof IteratorProto[ITERATOR] != 'function') {
          hide(IteratorProto, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorProto, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!IS_PURE || FORCED) && (BUGGY_SAFARI_ITERATORS || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for the `pure` version
  Iterators[NAME] = $default;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || VALUES_BUG }, methods);
  }
  return methods;
};

module.exports = {
  createIteratorConstructor: createIteratorConstructor,
  defineIterator: defineIterator
};
