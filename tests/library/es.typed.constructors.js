import { DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants';
import { createIterable } from '../helpers/helpers';

const { ArrayBuffer, Symbol } = core;
const { getOwnPropertyDescriptor, defineProperty, assign } = core.Object;

if (DESCRIPTORS) {
  for (const name in TYPED_ARRAYS) {
    const bytes = TYPED_ARRAYS[name];
    const TypedArray = core[name];

    QUnit.test(`${ name } constructor`, assert => {
      assert.isFunction(TypedArray);
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
      assert.throws(() => new TypedArray(new ArrayBuffer(8), -1), RangeError, 'If offset < 0, throw a RangeError exception');
      if (bytes !== 1) {
        assert.throws(() => new TypedArray(new ArrayBuffer(8), 3), RangeError, 'If offset modulo elementSize ≠ 0, throw a RangeError exception');
      }
      assert.throws(() => new TypedArray(new ArrayBuffer(8), 16), 'If newByteLength < 0, throw a RangeError exception');
      assert.throws(() => new TypedArray(new ArrayBuffer(24), 8, 24), 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
      assert.throws(() => TypedArray(1), TypeError, 'throws without `new`');
      assert.same(TypedArray[Symbol.species], TypedArray, '@@species');
    });

    QUnit.test(`${ name } descriptors`, assert => {
      const array = new TypedArray(2);
      const descriptor = getOwnPropertyDescriptor(array, 0);
      const base = {
        writable: descriptor.writable,
        enumerable: true,
        configurable: descriptor.configurable,
      };
      assert.deepEqual(getOwnPropertyDescriptor(array, 0), assign({
        value: 0,
      }, base), 'Object.getOwnPropertyDescriptor');
      assert.throws(() => defineProperty(array, 0, {
        value: 2,
        get() {
          return 2;
        },
      }), 'Object.defineProperty, invalid descriptor #4');
    });
  }
}
