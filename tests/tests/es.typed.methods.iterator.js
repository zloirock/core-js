import { GLOBAL, DESCRIPTORS, NATIVE, TYPED_ARRAYS } from '../helpers/constants';

var Symbol = GLOBAL.Symbol || {};

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.keys', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var keys = TypedArray.prototype.keys;
    assert.isFunction(keys, name + '::keys is function');
    assert.arity(keys, 0, name + '::keys arity is 0');
    assert.name(keys, 'keys', name + "::keys name is 'keys'");
    assert.looksNative(keys, name + '::keys looks native');
    var iterator = new TypedArray([1, 2, 3]).keys();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 0,
      done: false
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true
    }, 'done');
    if (NATIVE) assert.throws(function () {
      keys.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.values', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var values = TypedArray.prototype.values;
    assert.isFunction(values, name + '::values is function');
    assert.arity(values, 0, name + '::values arity is 0');
    assert.name(values, 'values', name + "::values name is 'values'");
    assert.looksNative(values, name + '::values looks native');
    var iterator = new TypedArray([1, 2, 3]).values();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 3,
      done: false
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true
    }, 'done');
    if (NATIVE) assert.throws(function () {
      values.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.entries', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    var entries = TypedArray.prototype.entries;
    assert.isFunction(entries, name + '::entries is function');
    assert.arity(entries, 0, name + '::entries arity is 0');
    assert.name(entries, 'entries', name + "::entries name is 'entries'");
    assert.looksNative(entries, name + '::entries looks native');
    var iterator = new TypedArray([1, 2, 3]).entries();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: [0, 1],
      done: false
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: [1, 2],
      done: false
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: [2, 3],
      done: false
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true
    }, 'done');
    if (NATIVE) assert.throws(function () {
      entries.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.@@iterator', function (assert) {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (var name in TYPED_ARRAYS) {
    var TypedArray = GLOBAL[name];
    assert.isIterable(TypedArray.prototype, name + ' is itrable');
    assert.arity(TypedArray.prototype[Symbol.iterator], 0, name + '::@@iterator arity is 0');
    assert.name(TypedArray.prototype[Symbol.iterator], 'values', name + "::@@iterator name is 'values'");
    assert.looksNative(TypedArray.prototype[Symbol.iterator], name + '::@@iterator looks native');
    assert.strictEqual(TypedArray.prototype[Symbol.iterator], TypedArray.prototype.values);
    var iterator = new TypedArray([1, 2, 3])[Symbol.iterator]();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 3,
      done: false
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true
    }, 'done');
    if (NATIVE) assert.throws(function () {
      TypedArray.prototype[Symbol.iterator].call([1, 2]);
    }, "isn't generic");
  }
});
