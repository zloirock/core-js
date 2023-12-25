import { NATIVE, TYPED_ARRAYS } from '../helpers/constants.js';
import { createIterable } from '../helpers/helpers.js';

const { getOwnPropertyDescriptor, getPrototypeOf } = Object;

for (const { name, TypedArray, bytes } of TYPED_ARRAYS) {
  QUnit.test(`${ name } constructor`, assert => {
    assert.isFunction(TypedArray);
    assert.arity(TypedArray, 3);
    assert.name(TypedArray, name);
    // Safari 5 bug
    if (NATIVE) assert.looksNative(TypedArray);
    assert.same(TypedArray.BYTES_PER_ELEMENT, bytes, `${ name }.BYTES_PER_ELEMENT`);
    let array = new TypedArray(4);
    assert.same(array.BYTES_PER_ELEMENT, bytes, '#BYTES_PER_ELEMENT');
    assert.same(array.byteOffset, 0, `${ name }#byteOffset, passed number`);
    assert.same(array.byteLength, 4 * bytes, '#byteLength, passed number');
    assert.arrayEqual(array, [0, 0, 0, 0], 'correct values, passed number');
    assert.notThrows(() => {
      // throws in IE / Edge / FF
      array = new TypedArray('0x4');
      assert.same(array.byteOffset, 0, '#byteOffset, passed string');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed string');
      assert.arrayEqual(array, [0, 0, 0, 0], 'correct values, passed string');
      return true;
    }, 'passed string');
    assert.notThrows(() => {
      // throws in IE / Edge / FF
      array = new TypedArray(true);
      assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
      assert.same(array.byteLength, 1 * bytes, '#byteLength, passed boolean');
      assert.arrayEqual(array, [0], 'correct values, passed boolean');
      return true;
    }, 'passed boolean');
    assert.notThrows(() => {
      array = new TypedArray();
      assert.same(array.byteOffset, 0, '#byteOffset, without arguments');
      assert.same(array.byteLength, 0, '#byteLength, without arguments');
      assert.arrayEqual(array, [], 'correct values, without arguments');
      return true;
    }, 'without arguments');
    assert.notThrows(() => {
      array = new TypedArray(undefined);
      assert.same(array.byteOffset, 0, '#byteOffset, passed undefined');
      assert.same(array.byteLength, 0, '#byteLength, passed undefined');
      assert.arrayEqual(array, [], 'correct values, passed undefined');
      return true;
    }, 'passed undefined');
    assert.notThrows(() => {
      array = new TypedArray(-0);
      assert.same(array.byteOffset, 0, '#byteOffset, passed -0');
      assert.same(array.byteLength, 0, '#byteLength, passed -0');
      assert.arrayEqual(array, [], 'correct values, passed -0');
      return true;
    }, 'passed -0');
    assert.notThrows(() => {
      array = new TypedArray(NaN);
      assert.same(array.byteOffset, 0, '#byteOffset, passed NaN');
      assert.same(array.byteLength, 0, '#byteLength, passed NaN');
      assert.arrayEqual(array, [], 'correct values, passed NaN');
      return true;
    }, 'passed NaN');
    assert.notThrows(() => {
      array = new TypedArray(1.5);
      assert.same(array.byteOffset, 0, '#byteOffset, passed 1.5');
      assert.same(array.byteLength, 1 * bytes, '#byteLength, passed 1.5');
      assert.arrayEqual(array, [0], 'correct values, passed 1.5');
      return true;
    }, 'passed 1.5');
    if (NATIVE) assert.throws(() => new TypedArray(-1), RangeError, 'throws on -1');
    assert.notThrows(() => {
      array = new TypedArray(null);
      assert.same(array.byteOffset, 0, '#byteOffset, passed null');
      assert.same(array.byteLength, 0, '#byteLength, passed null');
      assert.arrayEqual(array, [], 'correct values, passed null');
      return true;
    }, 'passed null');
    array = new TypedArray([1, 2, 3, 4]);
    assert.same(array.byteOffset, 0, '#byteOffset, passed array');
    assert.same(array.byteLength, 4 * bytes, '#byteLength, passed array');
    assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed array');
    array = new TypedArray({
      0: 1,
      1: 2,
      2: 3,
      3: 4,
      length: 4,
    });
    assert.same(array.byteOffset, 0, '#byteOffset, passed array-like');
    assert.same(array.byteLength, 4 * bytes, '#byteLength, passed array-like');
    assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed array-like');
    assert.notThrows(() => {
      // throws in IE / Edge
      array = new TypedArray({});
      assert.same(array.byteOffset, 0, '#byteOffset, passed empty object (also array-like case)');
      assert.same(array.byteLength, 0, '#byteLength, passed empty object (also array-like case)');
      assert.arrayEqual(array, [], 'correct values, passed empty object (also array-like case)');
      return true;
    }, 'passed empty object (also array-like case)');
    assert.notThrows(() => {
      array = new TypedArray(createIterable([1, 2, 3, 4]));
      assert.same(array.byteOffset, 0, '#byteOffset, passed iterable');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed iterable');
      assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed iterable');
      return true;
    }, 'passed iterable');
    assert.notThrows(() => {
      array = new TypedArray([{ valueOf() { return 2; } }]);
      assert.same(array.byteOffset, 0, '#byteOffset, passed array with object convertible to primitive');
      assert.same(array.byteLength, bytes, '#byteLength, passed array with object convertible to primitive');
      assert.arrayEqual(array, [2], 'correct values, passed array with object convertible to primitive');
      return true;
    }, 'passed array with object convertible to primitive');
    assert.notThrows(() => {
      array = new TypedArray(createIterable([{ valueOf() { return 2; } }]));
      assert.same(array.byteOffset, 0, '#byteOffset, passed iterable with object convertible to primitive');
      assert.same(array.byteLength, bytes, '#byteLength, passed iterable with object convertible to primitive');
      assert.arrayEqual(array, [2], 'correct values, passed iterable with object convertible to primitive');
      return true;
    }, 'passed iterable with object convertible to primitive');
    array = new TypedArray(new TypedArray([1, 2, 3, 4]));
    assert.same(array.byteOffset, 0, '#byteOffset, passed typed array');
    assert.same(array.byteLength, 4 * bytes, '#byteLength, passed typed array');
    assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed typed array');
    const fake = new TypedArray([1, 2, 3, 4]);
    fake[Symbol.iterator] = function () {
      return createIterable([4, 3, 2, 1])[Symbol.iterator]();
    };
    array = new TypedArray(fake);
    assert.same(array.byteOffset, 0, '#byteOffset, passed typed array with custom iterator');
    assert.same(array.byteLength, 4 * bytes, '#byteLength, passed typed array with custom iterator');
    // https://code.google.com/p/v8/issues/detail?id=4552
    assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed typed array with custom iterator');
    array = new TypedArray(new ArrayBuffer(8));
    assert.same(array.byteOffset, 0, '#byteOffset, passed buffer');
    assert.same(array.byteLength, 8, '#byteLength, passed buffer');
    assert.same(array.length, 8 / bytes, 'correct length, passed buffer');
    array = new TypedArray(new ArrayBuffer(16), 8);
    assert.same(array.byteOffset, 8, '#byteOffset, passed buffer and byteOffset');
    assert.same(array.byteLength, 8, '#byteLength, passed buffer and byteOffset');
    assert.same(array.length, 8 / bytes, 'correct length, passed buffer and byteOffset');
    array = new TypedArray(new ArrayBuffer(24), 8, 8 / bytes);
    assert.same(array.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and length');
    assert.same(array.byteLength, 8, '#byteLength, passed buffer, byteOffset and length');
    assert.same(array.length, 8 / bytes, 'correct length, passed buffer, byteOffset and length');
    array = new TypedArray(new ArrayBuffer(8), undefined);
    assert.same(array.byteOffset, 0, '#byteOffset, passed buffer and undefined');
    assert.same(array.byteLength, 8, '#byteLength, passed buffer and undefined');
    assert.same(array.length, 8 / bytes, 'correct length, passed buffer and undefined');
    array = new TypedArray(new ArrayBuffer(16), 8, undefined);
    assert.same(array.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and undefined');
    assert.same(array.byteLength, 8, '#byteLength, passed buffer, byteOffset and undefined');
    assert.same(array.length, 8 / bytes, 'correct length, passed buffer, byteOffset and undefined');
    array = new TypedArray(new ArrayBuffer(8), 8);
    assert.same(array.byteOffset, 8, '#byteOffset, passed buffer and byteOffset with buffer length');
    assert.same(array.byteLength, 0, '#byteLength, passed buffer and byteOffset with buffer length');
    assert.arrayEqual(array, [], 'correct values, passed buffer and byteOffset with buffer length');
    // FF bug - TypeError instead of RangeError
    assert.throws(() => new TypedArray(new ArrayBuffer(8), -1), RangeError, 'If offset < 0, throw a RangeError exception');
    if (bytes !== 1) {
      // FF bug - TypeError instead of RangeError
      assert.throws(() => new TypedArray(new ArrayBuffer(8), 3), RangeError, 'If offset modulo elementSize ≠ 0, throw a RangeError exception');
    }
    if (NATIVE) {
      if (bytes !== 1) {
        // fails in Opera 12
        assert.throws(() => new TypedArray(new ArrayBuffer(9)), RangeError, 'If bufferByteLength modulo elementSize ≠ 0, throw a RangeError exception');
      }
      assert.throws(() => new TypedArray(new ArrayBuffer(8), 16), RangeError, 'If newByteLength < 0, throw a RangeError exception');
      assert.throws(() => new TypedArray(new ArrayBuffer(24), 8, 24), RangeError, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
    } else { // FF bug - TypeError instead of RangeError
      assert.throws(() => new TypedArray(new ArrayBuffer(8), 16), 'If newByteLength < 0, throw a RangeError exception');
      assert.throws(() => new TypedArray(new ArrayBuffer(24), 8, 24), 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
    }
    // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
    assert.throws(() => TypedArray(1), TypeError, 'throws without `new`');
    assert.same(TypedArray[Symbol.species], TypedArray, '@@species');
  });

  QUnit.test(`${ name } @@toStringTag`, assert => {
    const TypedArrayPrototype = getPrototypeOf(TypedArray.prototype);
    const descriptor = getOwnPropertyDescriptor(TypedArrayPrototype, Symbol.toStringTag);
    const getter = descriptor.get;
    assert.isFunction(getter);
    assert.same(getter.call(new Int8Array(1)), 'Int8Array');
    assert.same(getter.call(new TypedArray(1)), name);
    assert.same(getter.call([]), undefined);
    assert.same(getter.call({}), undefined);
    assert.same(getter.call(), undefined);
  });
}
