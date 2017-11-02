var test = QUnit.test;
var ArrayBuffer = core.ArrayBuffer;
var Symbol = core.Symbol;
var keys = core.Object.keys;
var getOwnPropertyDescriptor = core.Object.getOwnPropertyDescriptor;
var defineProperty = core.Object.defineProperty;
var assign = core.Object.assign;

var arrays = {
  Float32Array: 4,
  Float64Array: 8,
  Int8Array: 1,
  Int16Array: 2,
  Int32Array: 4,
  Uint8Array: 1,
  Uint16Array: 2,
  Uint32Array: 4,
  Uint8ClampedArray: 1
};

if (DESCRIPTORS) {
  for (var name in arrays) !function (name, bytes) {
    var TypedArray = core[name];

    test(name + ' constructor', function (assert) {
      assert.isFunction(TypedArray);
      assert.same(TypedArray.BYTES_PER_ELEMENT, bytes, name + '.BYTES_PER_ELEMENT');
      var array = new TypedArray(4);
      assert.same(array.BYTES_PER_ELEMENT, bytes, '#BYTES_PER_ELEMENT');
      assert.same(array.byteOffset, 0, name + '#byteOffset, passed number');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed number');
      assert.arrayEqual(array, [0, 0, 0, 0], 'correct values, passed number');
      try {
        array = new TypedArray('0x4');
        assert.same(array.byteOffset, 0, '#byteOffset, passed string');
        assert.same(array.byteLength, 4 * bytes, '#byteLength, passed string');
        assert.arrayEqual(array, [0, 0, 0, 0], 'correct values, passed string');
      } catch (e) {
        assert.same(e, [0, 0, 0, 0], 'passed string');
      }
      try {
        array = new TypedArray(true);
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 1 * bytes, '#byteLength, passed boolean');
        assert.arrayEqual(array, [0], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [0], 'passed boolean');
      }
      try {
        array = new TypedArray();
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 0, '#byteLength, passed boolean');
        assert.arrayEqual(array, [], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [], 'passed boolean');
      }
      try {
        array = new TypedArray(undefined);
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 0, '#byteLength, passed boolean');
        assert.arrayEqual(array, [], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [], 'passed boolean');
      }
      try {
        array = new TypedArray(-0);
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 0, '#byteLength, passed boolean');
        assert.arrayEqual(array, [], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [], 'passed boolean');
      }
      try {
        array = new TypedArray(NaN);
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 0, '#byteLength, passed boolean');
        assert.arrayEqual(array, [], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [], 'passed boolean');
      }
      try {
        array = new TypedArray(1.5);
        assert.same(array.byteOffset, 0, '#byteOffset, passed boolean');
        assert.same(array.byteLength, 1 * bytes, '#byteLength, passed boolean');
        assert.arrayEqual(array, [0], 'correct values, passed boolean');
      } catch (e) {
        assert.same(e, [0], 'passed boolean');
      }
      NATIVE && assert['throws'](function () {
        new TypedArray(-1);
      }, RangeError, 'throws on -1');
      try {
        array = new TypedArray(null);
        assert.same(array.byteOffset, 0, '#byteOffset, passed null');
        assert.same(array.byteLength, 0, '#byteLength, passed null');
        assert.arrayEqual(array, [], 'correct values, passed null');
      } catch (e) {
        assert.same(e, [], 'passed null');
      }
      array = new TypedArray([1, 2, 3, 4]);
      assert.same(array.byteOffset, 0, '#byteOffset, passed array');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed array');
      assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed array');
      array = new TypedArray({
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        length: 4
      });
      assert.same(array.byteOffset, 0, '#byteOffset, passed array-like');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed array-like');
      assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed array-like');
      try {
        array = new TypedArray({});
        assert.same(array.byteOffset, 0, '#byteOffset, passed empty object (also array-like case)');
        assert.same(array.byteLength, 0, '#byteLength, passed empty object (also array-like case)');
        assert.arrayEqual(array, [], 'correct values, passed empty object (also array-like case)');
      } catch (e) {
        assert.same(e, [], 'passed empty object (also array-like case)');
      }
      try {
        array = new TypedArray(createIterable([1, 2, 3, 4]));
        assert.same(array.byteOffset, 0, '#byteOffset, passed iterable');
        assert.same(array.byteLength, 4 * bytes, '#byteLength, passed iterable');
        assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed iterable');
      } catch (e) {
        assert.same(e, [1, 2, 3, 4], 'passed iterable');
      }
      array = new TypedArray(new TypedArray([1, 2, 3, 4]));
      assert.same(array.byteOffset, 0, '#byteOffset, passed typed array');
      assert.same(array.byteLength, 4 * bytes, '#byteLength, passed typed array');
      assert.arrayEqual(array, [1, 2, 3, 4], 'correct values, passed typed array');
      var fake = new TypedArray([1, 2, 3, 4]);
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
      assert['throws'](function () {
        new TypedArray(new ArrayBuffer(8), -1);
      }, RangeError, 'If offset < 0, throw a RangeError exception');
      if (bytes !== 1) {
        assert['throws'](function () {
          new TypedArray(new ArrayBuffer(8), 3);
        }, RangeError, 'If offset modulo elementSize ≠ 0, throw a RangeError exception');
      }
      if (NATIVE) {
        if (bytes !== 1) {
          assert['throws'](function () {
            new TypedArray(new ArrayBuffer(9));
          }, RangeError, 'If bufferByteLength modulo elementSize ≠ 0, throw a RangeError exception');
        }
        assert['throws'](function () {
          new TypedArray(new ArrayBuffer(8), 16);
        }, RangeError, 'If newByteLength < 0, throw a RangeError exception');
        assert['throws'](function () {
          new TypedArray(new ArrayBuffer(24), 8, 24);
        }, RangeError, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
      } else {
        assert['throws'](function () {
          new TypedArray(new ArrayBuffer(8), 16);
        }, 'If newByteLength < 0, throw a RangeError exception');
        assert['throws'](function () {
          new TypedArray(new ArrayBuffer(24), 8, 24);
        }, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception');
      }
      assert['throws'](function () {
        TypedArray(1);
      }, TypeError, 'throws without `new`');
      assert.same(TypedArray[Symbol.species], TypedArray, '@@species');
    });

    test(name + ' descriptors', function (assert) {
      var array = new TypedArray(2);
      var descriptor = getOwnPropertyDescriptor(array, 0);
      var base = NATIVE ? {
        writable: true,
        enumerable: true,
        configurable: false
      } : {
        writable: descriptor.writable,
        enumerable: true,
        configurable: descriptor.configurable
      };
      assert.deepEqual(getOwnPropertyDescriptor(array, 0), assign({
        value: 0
      }, base), 'Object.getOwnPropertyDescriptor');
      if (NATIVE) {
        assert.arrayEqual(keys(array), ['0', '1'], 'Object.keys');
        var results = [];
        for (var key in array) results.push(key);
        assert.arrayEqual(results, ['0', '1'], 'for-in');
        defineProperty(array, 0, {
          value: 1,
          writable: true,
          enumerable: true,
          configurable: false
        });
        array[0] = array[1] = 2.5;
        assert.deepEqual(getOwnPropertyDescriptor(array, 0), assign({
          value: array[1]
        }, base), 'Object.defineProperty, valid descriptor #1');
        defineProperty(array, 0, {
          value: 1
        });
        array[0] = array[1] = 3.5;
        assert.deepEqual(getOwnPropertyDescriptor(array, 0), assign({
          value: array[1]
        }, base), 'Object.defineProperty, valid descriptor #2');
        try {
          defineProperty(array, 0, {
            value: 2,
            writable: false,
            enumerable: true,
            configurable: false
          });
          assert.ok(false, 'Object.defineProperty, invalid descriptor #1');
        } catch (e) {
          assert.ok(true, 'Object.defineProperty, invalid descriptor #1');
        }
        try {
          defineProperty(array, 0, {
            value: 2,
            writable: true,
            enumerable: false,
            configurable: false
          });
          assert.ok(false, 'Object.defineProperty, invalid descriptor #2');
        } catch (e) {
          assert.ok(true, 'Object.defineProperty, invalid descriptor #2');
        }
        try {
          defineProperty(array, 0, {
            get: function () {
              return 2;
            }
          });
          assert.ok(false, 'Object.defineProperty, invalid descriptor #3');
        } catch (e) {
          assert.ok(true, 'Object.defineProperty, invalid descriptor #3');
        }
      }
      try {
        defineProperty(array, 0, {
          value: 2,
          get: function () {
            return 2;
          }
        });
        assert.ok(false, 'Object.defineProperty, invalid descriptor #4');
      } catch (e) {
        assert.ok(true, 'Object.defineProperty, invalid descriptor #4');
      }
    });
  }(name, arrays[name]);
}
