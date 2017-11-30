import { DESCRIPTORS, GLOBAL, NATIVE, TYPED_ARRAYS } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.keys', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { keys } = TypedArray.prototype;
    assert.isFunction(keys, `${ name }::keys is function`);
    assert.arity(keys, 0, `${ name }::keys arity is 0`);
    assert.name(keys, 'keys', `${ name }::keys name is 'keys'`);
    assert.looksNative(keys, `${ name }::keys looks native`);
    const iterator = new TypedArray([1, 2, 3]).keys();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 0,
      done: false,
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false,
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false,
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true,
    }, 'done');
    if (NATIVE) assert.throws(() => {
      return keys.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.values', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { values } = TypedArray.prototype;
    assert.isFunction(values, `${ name }::values is function`);
    assert.arity(values, 0, `${ name }::values arity is 0`);
    assert.name(values, 'values', `${ name }::values name is 'values'`);
    assert.looksNative(values, `${ name }::values looks native`);
    const iterator = new TypedArray([1, 2, 3]).values();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false,
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false,
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 3,
      done: false,
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true,
    }, 'done');
    if (NATIVE) assert.throws(() => {
      return values.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.entries', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { entries } = TypedArray.prototype;
    assert.isFunction(entries, `${ name }::entries is function`);
    assert.arity(entries, 0, `${ name }::entries arity is 0`);
    assert.name(entries, 'entries', `${ name }::entries name is 'entries'`);
    assert.looksNative(entries, `${ name }::entries looks native`);
    const iterator = new TypedArray([1, 2, 3]).entries();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: [0, 1],
      done: false,
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: [1, 2],
      done: false,
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: [2, 3],
      done: false,
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true,
    }, 'done');
    if (NATIVE) assert.throws(() => {
      return entries.call([1, 2]);
    }, "isn't generic");
  }
});

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.@@iterator', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    assert.isIterable(TypedArray.prototype, `${ name } is itrable`);
    assert.arity(TypedArray.prototype[Symbol.iterator], 0, `${ name }::@@iterator arity is 0`);
    assert.name(TypedArray.prototype[Symbol.iterator], 'values', `${ name }::@@iterator name is 'values'`);
    assert.looksNative(TypedArray.prototype[Symbol.iterator], `${ name }::@@iterator looks native`);
    assert.strictEqual(TypedArray.prototype[Symbol.iterator], TypedArray.prototype.values);
    const iterator = new TypedArray([1, 2, 3])[Symbol.iterator]();
    assert.isIterator(iterator);
    assert.isIterable(iterator);
    assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
    assert.deepEqual(iterator.next(), {
      value: 1,
      done: false,
    }, 'step 1');
    assert.deepEqual(iterator.next(), {
      value: 2,
      done: false,
    }, 'step 2');
    assert.deepEqual(iterator.next(), {
      value: 3,
      done: false,
    }, 'step 3');
    assert.deepEqual(iterator.next(), {
      value: undefined,
      done: true,
    }, 'done');
    if (NATIVE) assert.throws(() => {
      return TypedArray.prototype[Symbol.iterator].call([1, 2]);
    }, "isn't generic");
  }
});
