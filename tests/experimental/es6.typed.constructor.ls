{module, test} = QUnit
module \ES6
if DESCRIPTORS
  for name, bytes of {Float32Array: 4, Float64Array: 8, Int8Array: 1, Int16Array: 2, Int32Array: 4, Uint8Array: 1, Uint16Array: 2, Uint32Array: 4, Uint8ClampedArray: 1}
    test "#{name} constructor", !(assert)~>
      Typed = global[name]
      assert.isFunction Typed
      assert.arity Typed, 3
      assert.name Typed, name
      assert.looksNative Typed

      assert.same Typed.BYTES_PER_ELEMENT, bytes, '%TypedArray%.BYTES_PER_ELEMENT'
      a = new Typed 4
      assert.same a.BYTES_PER_ELEMENT, bytes, '%TypedArray%#BYTES_PER_ELEMENT'
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed length'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed length'
      assert.arrayEqual a, [0 0 0 0], 'correct values, passed length'

      a = new Typed [1 2 3 4]
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed array'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed array'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed array'

      a = new Typed {0: 1, 1: 2, 2: 3, 3: 4, length: 4}
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed array-like'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed array-like'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed array-like'

      a = new Typed createIterable [1 2 3 4]
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed iterable'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed iterable'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed iterable'

      a = new Typed new Typed [1 2 3 4]
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed typed array'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed typed array'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed typed array'

      b = new Typed [1 2 3 4]
      b[Symbol?iterator] = -> createIterable([4 3 2 1])[Symbol?iterator]!
      a = new Typed b
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed typed array with custom iterator'
      assert.same a.byteLength, 4 * bytes, '%TypedArray%#byteLength, passed typed array with custom iterator'
      # V8 bug, https://code.google.com/p/v8/issues/detail?id=4552
      NATIVE and assert.arrayEqual a, [1 2 3 4], 'correct values, passed typed array with custom iterator'

      a = new Typed new ArrayBuffer 8
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed buffer'
      assert.same a.byteLength, 8, '%TypedArray%#byteLength, passed buffer'
      assert.same a.length, 8 / bytes, '%TypedArray%#length, passed buffer'

      a = new Typed new ArrayBuffer(16), 8
      assert.same a.byteOffset, 8, '%TypedArray%#byteOffset, passed buffer and byteOffset'
      assert.same a.byteLength, 8, '%TypedArray%#byteLength, passed buffer and byteOffset'
      assert.same a.length, 8 / bytes, '%TypedArray%#length, passed buffer and byteOffset'

      a = new Typed new ArrayBuffer(24), 8, 8
      assert.same a.byteOffset, 8, '%TypedArray%#byteOffset, passed buffer, byteOffset and byteLength'
      assert.same a.byteLength, 8, '%TypedArray%#byteLength, passed buffer, byteOffset and byteLength'
      assert.same a.length, 8 / bytes, '%TypedArray%#length, passed buffer, byteOffset and byteLength'

      a = new Typed new ArrayBuffer(8), void
      assert.same a.byteOffset, 0, '%TypedArray%#byteOffset, passed buffer and undefined'
      assert.same a.byteLength, 8, '%TypedArray%#byteLength, passed buffer and undefined'
      assert.same a.length, 8 / bytes, '%TypedArray%#length, passed buffer and undefined'

      a = new Typed new ArrayBuffer(16), 8, void
      assert.same a.byteOffset, 8, '%TypedArray%#byteOffset, passed buffer, byteOffset and undefined'
      assert.same a.byteLength, 8, '%TypedArray%#byteLength, passed buffer, byteOffset and undefined'
      assert.same a.length, 8 / bytes, '%TypedArray%#length, passed buffer, byteOffset and undefined'

      a = new Typed new ArrayBuffer(8), 8
      assert.same a.byteOffset, 8, '%TypedArray%#byteOffset, passed buffer and byteOffset with buffer length'
      assert.same a.byteLength, 0, '%TypedArray%#byteLength, passed buffer and byteOffset with buffer length'
      assert.same a.length, 0, '%TypedArray%#length, passed buffer and byteOffset with buffer length'