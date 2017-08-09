{module, test} = QUnit
{keys, getOwnPropertyDescriptor, defineProperty} = core.Object
module \ES
if DESCRIPTORS
  {ArrayBuffer} = core
  for $name, $bytes of {Float32Array: 4, Float64Array: 8, Int8Array: 1, Int16Array: 2, Int32Array: 4, Uint8Array: 1, Uint16Array: 2, Uint32Array: 4, Uint8ClampedArray: 1}
    let name = $name, bytes = $bytes
      Typed = core[name]
      test "#{name} constructor" !(assert)~>
        assert.isFunction Typed

        assert.same Typed.BYTES_PER_ELEMENT, bytes, "#{name}.BYTES_PER_ELEMENT"
        a = new Typed 4
        assert.same a.BYTES_PER_ELEMENT, bytes, '#BYTES_PER_ELEMENT'
        assert.same a.byteOffset, 0, name + '#byteOffset, passed number'
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

        try
          a = new Typed!
          assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
          assert.same a.byteLength, 0, '#byteLength, passed boolean'
          assert.arrayEqual a, [], 'correct values, passed boolean'
        catch e => assert.same e, [], 'passed boolean'

        try
          a = new Typed void
          assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
          assert.same a.byteLength, 0, '#byteLength, passed boolean'
          assert.arrayEqual a, [], 'correct values, passed boolean'
        catch e => assert.same e, [], 'passed boolean'

        try
          a = new Typed -0
          assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
          assert.same a.byteLength, 0, '#byteLength, passed boolean'
          assert.arrayEqual a, [], 'correct values, passed boolean'
        catch e => assert.same e, [], 'passed boolean'

        try
          a = new Typed NaN
          assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
          assert.same a.byteLength, 0, '#byteLength, passed boolean'
          assert.arrayEqual a, [], 'correct values, passed boolean'
        catch e => assert.same e, [], 'passed boolean'

        try
          a = new Typed 1.5
          assert.same a.byteOffset, 0, '#byteOffset, passed boolean'
          assert.same a.byteLength, 1 * bytes, '#byteLength, passed boolean'
          assert.arrayEqual a, [0], 'correct values, passed boolean'
        catch e => assert.same e, [0], 'passed boolean'

        NATIVE and assert.throws (!-> new Typed -1), RangeError, 'throws on -1'

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

        a = new Typed new ArrayBuffer(8)
        assert.same a.byteOffset, 0, '#byteOffset, passed buffer'
        assert.same a.byteLength, 8, '#byteLength, passed buffer'
        assert.same a.length, 8 / bytes, 'correct length, passed buffer'

        a = new Typed new ArrayBuffer(16), 8
        assert.same a.byteOffset, 8, '#byteOffset, passed buffer and byteOffset'
        assert.same a.byteLength, 8, '#byteLength, passed buffer and byteOffset'
        assert.same a.length, 8 / bytes, 'correct length, passed buffer and byteOffset'

        a = new Typed new ArrayBuffer(24), 8, 8 / bytes
        assert.same a.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and length'
        assert.same a.byteLength, 8, '#byteLength, passed buffer, byteOffset and length'
        assert.same a.length, 8 / bytes, 'correct length, passed buffer, byteOffset and length'

        a = new Typed new ArrayBuffer(8), void
        assert.same a.byteOffset, 0, '#byteOffset, passed buffer and undefined'
        assert.same a.byteLength, 8, '#byteLength, passed buffer and undefined'
        assert.same a.length, 8 / bytes, 'correct length, passed buffer and undefined'

        a = new Typed new ArrayBuffer(16), 8, void
        assert.same a.byteOffset, 8, '#byteOffset, passed buffer, byteOffset and undefined'
        assert.same a.byteLength, 8, '#byteLength, passed buffer, byteOffset and undefined'
        assert.same a.length, 8 / bytes, 'correct length, passed buffer, byteOffset and undefined'

        a = new Typed new ArrayBuffer(8), 8
        assert.same a.byteOffset, 8, '#byteOffset, passed buffer and byteOffset with buffer length'
        assert.same a.byteLength, 0, '#byteLength, passed buffer and byteOffset with buffer length'
        assert.arrayEqual a, [], 'correct values, passed buffer and byteOffset with buffer length'

        assert.throws (!-> new Typed new ArrayBuffer(8), -1), RangeError, 'If offset < 0, throw a RangeError exception' # FF bug - TypeError instead of RangeError
        if bytes isnt 1
          assert.throws (!-> new Typed new ArrayBuffer(8), 3), RangeError, 'If offset modulo elementSize ≠ 0, throw a RangeError exception' # FF bug - TypeError instead of RangeError

        if NATIVE
          if bytes isnt 1
            assert.throws (!-> new Typed new ArrayBuffer 9), RangeError, 'If bufferByteLength modulo elementSize ≠ 0, throw a RangeError exception'
          assert.throws (!-> new Typed new ArrayBuffer(8), 16), RangeError, 'If newByteLength < 0, throw a RangeError exception'
          assert.throws (!-> new Typed new ArrayBuffer(24), 8, 24), RangeError, 'If offset+newByteLength > bufferByteLength, throw a RangeError exception'
        else # FF bug - TypeError instead of RangeError
          # if bytes isnt 1
            # assert.throws (!-> new Typed new ArrayBuffer 9), 'If bufferByteLength modulo elementSize ≠ 0, throw a RangeError exception' # fails in Opera 12
          assert.throws (!-> new Typed new ArrayBuffer(8), 16), 'If newByteLength < 0, throw a RangeError exception'
          assert.throws (!-> new Typed new ArrayBuffer(24), 8, 24), 'If offset+newByteLength > bufferByteLength, throw a RangeError exception'

        assert.throws (!-> Typed 1), TypeError, 'throws without `new`'
        assert.same Typed[core.Symbol?species], Typed, '@@species'

      test "#{name} descriptors" (assert)!->
        typed = new Typed 2
        # V8 ~ Chrome 44- bug - descriptor marked as configurable
        # WebKit bug - marked as non-writable
        desc = getOwnPropertyDescriptor typed, 0
        base = if NATIVE => {writable: on, enumerable: on, configurable: no} else {writable: desc.writable, enumerable: on, configurable: desc.configurable}
        NATIVE and assert.arrayEqual [key for key of typed], <[0 1]>, 'for-in' # fails in old WebKit
        NATIVE and assert.arrayEqual keys(typed), <[0 1]>, 'Object.keys' # fails in old WebKit
        assert.deepEqual getOwnPropertyDescriptor(typed, 0), {value: 0} <<< base, 'Object.getOwnPropertyDescriptor'
        if NATIVE # V8 ~ Chrome 44- / WebKit bug
          defineProperty typed, 0, {value: 1, writable: on, enumerable: on, configurable: no}
          typed[0] = typed[1] = 2.5
          assert.deepEqual getOwnPropertyDescriptor(typed, 0), {value: typed[1]} <<< base, 'Object.defineProperty, valid descriptor #1'
          defineProperty typed, 0, {value: 1}
          typed[0] = typed[1] = 3.5
          assert.deepEqual getOwnPropertyDescriptor(typed, 0), {value: typed[1]} <<< base, 'Object.defineProperty, valid descriptor #2'
        NATIVE and try # fails in old WebKit ~ PhantomJS
          defineProperty typed, 0, {value: 2, writable: no, enumerable: on, configurable: no}
          assert.ok no, 'Object.defineProperty, invalid descriptor #1'
        catch
          assert.ok on, 'Object.defineProperty, invalid descriptor #1'
        NATIVE and try # fails in old WebKit ~ Android 4.0
          defineProperty typed, 0, {value: 2, writable: on, enumerable: no, configurable: no}
          assert.ok no, 'Object.defineProperty, invalid descriptor #2'
        catch
          assert.ok on, 'Object.defineProperty, invalid descriptor #2'
        NATIVE and try # fails in V8 ~ Chrome 44-
          defineProperty typed, 0, {get: -> 2}
          assert.ok no, 'Object.defineProperty, invalid descriptor #3'
        catch
          assert.ok on, 'Object.defineProperty, invalid descriptor #3'
        try
          defineProperty typed, 0, {value: 2, get: -> 2}
          assert.ok no, 'Object.defineProperty, invalid descriptor #4'
        catch
          assert.ok on, 'Object.defineProperty, invalid descriptor #4'