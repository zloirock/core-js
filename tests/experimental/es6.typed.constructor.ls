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

      assert.same Typed.BYTES_PER_ELEMENT, bytes, "#{name}.BYTES_PER_ELEMENT"
      a = new Typed 4
      assert.same a.BYTES_PER_ELEMENT, bytes, '#BYTES_PER_ELEMENT'
      assert.same a.byteOffset, 0, '#byteOffset, passed number'
      assert.same a.byteLength, 4 * bytes, '#byteLength, passed number'
      assert.arrayEqual a, [0 0 0 0], 'correct values, passed number'

      try
        a = new Typed '0x4' # throws in IE / Edge / FF
        assert.same a.byteOffset, 0, '#byteOffset, passed string'
        assert.same a.byteLength, 4 * bytes, '#byteLength, passed string'
        assert.arrayEqual a, [0 0 0 0], 'correct values, passed string'
      catch e => assert.same e, [0 0 0 0], 'passed string'

      try
        a = new Typed on # throws in IE / Edge / FF
        assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
        assert.same a.byteLength, 1 * bytes, '#byteLength, passed boolean'
        assert.arrayEqual a, [0], 'correct values, passed boolean'
      catch e => assert.same e, [0], 'passed boolean'

      assert.throws (!-> new Typed), TypeError, 'throws without argument'
      assert.throws (!-> new Typed void), TypeError, 'throws on undefined'
      assert.throws (!-> new Typed 1.5), RangeError, 'throws on 1.5'
      assert.throws (!-> new Typed -1), RangeError, 'throws on -1'
      assert.throws (!-> new Typed -0), RangeError, 'throws on -0'
      assert.throws (!-> new Typed NaN), RangeError, 'throws on NaN'

      try
        a = new Typed null # throws in most engines
        assert.same a.byteOffset, 0, '#byteOffset, passed null'
        assert.same a.byteLength, 0, '#byteLength, passed null'
        assert.arrayEqual a, [], 'correct values, passed null'
      catch e => assert.same e, [], 'passed null'

      a = new Typed [1 2 3 4]
      assert.same a.byteOffset, 0, '#byteOffset, passed array'
      assert.same a.byteLength, 4 * bytes, '#byteLength, passed array'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed array'

      a = new Typed {0: 1, 1: 2, 2: 3, 3: 4, length: 4}
      assert.same a.byteOffset, 0, '#byteOffset, passed array-like'
      assert.same a.byteLength, 4 * bytes, '#byteLength, passed array-like'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed array-like'

      try
        a = new Typed {} # throws in IE / Edge
        assert.same a.byteOffset, 0, '#byteOffset, passed empty object (also array-like case)'
        assert.same a.byteLength, 0, '#byteLength, passed empty object (also array-like case)'
        assert.arrayEqual a, [], 'correct values, passed empty object (also array-like case)'
      catch e => assert.same e, [], 'passed empty object (also array-like case)'

      try
        a = new Typed createIterable [1 2 3 4]
        assert.same a.byteOffset, 0, '#byteOffset, passed iterable'
        assert.same a.byteLength, 4 * bytes, '#byteLength, passed iterable'
        assert.arrayEqual a, [1 2 3 4], 'correct values, passed iterable'
      catch e => assert.same e, [1 2 3 4], 'passed iterable'

      a = new Typed new Typed [1 2 3 4]
      assert.same a.byteOffset, 0, '#byteOffset, passed typed array'
      assert.same a.byteLength, 4 * bytes, '#byteLength, passed typed array'
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed typed array'

      b = new Typed [1 2 3 4]
      b[Symbol?iterator] = -> createIterable([4 3 2 1])[Symbol?iterator]!
      a = new Typed b
      assert.same a.byteOffset, 0, '#byteOffset, passed typed array with custom iterator'
      assert.same a.byteLength, 4 * bytes, '#byteLength, passed typed array with custom iterator'
      # V8 bug, https://code.google.com/p/v8/issues/detail?id=4552
      assert.arrayEqual a, [1 2 3 4], 'correct values, passed typed array with custom iterator'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8]).buffer
      assert.same a.byteOffset, 0, '#byteOffset, passed buffer'
      assert.same a.byteLength, 8, '#byteLength, passed buffer'
      assert.arrayEqual a, [1 2 3 4 5 6 7 8], 'correct values, passed buffer'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16]).buffer, 8
      assert.same a.byteOffset, 8, '#byteOffset, passed buffer and byteOffset'
      assert.same a.byteLength, 8, '#byteLength, passed buffer and byteOffset'
      assert.arrayEqual a, [9 10 11 12 13 14 15 16], 'correct values, passed buffer and byteOffset'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24]).buffer, 8, 8
      assert.same a.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and byteLength'
      assert.same a.byteLength, 8, '#byteLength, passed buffer, byteOffset and byteLength'
      assert.arrayEqual a, [9 10 11 12 13 14 15 16], 'correct values, passed buffer, byteOffset and byteLength'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8]).buffer, void
      assert.same a.byteOffset, 0, '#byteOffset, passed buffer and undefined'
      assert.same a.byteLength, 8, '#byteLength, passed buffer and undefined'
      assert.arrayEqual a, [1 2 3 4 5 6 7 8], 'correct values, passed buffer and undefined'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16]).buffer, 8, void
      assert.same a.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and undefined'
      assert.same a.byteLength, 8, '#byteLength, passed buffer, byteOffset and undefined'
      assert.arrayEqual a, [9 10 11 12 13 14 15 16], 'correct values, passed buffer, byteOffset and undefined'

      a = new Typed new Uint8Array([1 2 3 4 5 6 7 8]).buffer, 8
      assert.same a.byteOffset, 8, '#byteOffset, passed buffer and byteOffset with buffer length'
      assert.same a.byteLength, 0, '#byteLength, passed buffer and byteOffset with buffer length'
      assert.arrayEqual a, [], 'correct values, passed buffer and byteOffset with buffer length'

      assert.throws (!-> new Typed new ArrayBuffer(8), -1), RangeError, 'If offset < 0, throw a RangeError exception'
      if bytes isnt 1
        assert.throws (!-> new Typed new ArrayBuffer(8), 3), RangeError, 'If offset modulo elementSize ≠ 0, throw a RangeError exception'
        assert.throws (!-> new Typed new ArrayBuffer 9), RangeError, 'If bufferByteLength modulo elementSize ≠ 0, throw a RangeError exception'
      assert.throws (!-> new Typed new ArrayBuffer(8), 16), RangeError, 'If newByteLength < 0, throw a RangeError exception'
      assert.throws (!-> new Typed new ArrayBuffer(24), 8, 24), RangeError, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception'

      assert.throws (!-> Typed 1), TypeError, 'throws without `new`'