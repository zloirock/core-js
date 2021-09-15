/* eslint-disable max-nested-callbacks -- teehee */
/* eslint-disable no-restricted-globals -- wpt */
/* global structuredClone -- global test */

// Originally from: https://github.com/web-platform-tests/wpt/blob/4b35e758e2fc4225368304b02bcec9133965fd1a/IndexedDB/structured-clone.any.js
// Copyright © web-platform-tests contributors. Available under the 3-Clause BSD License.

QUnit.module('structuredClone', () => {
  QUnit.test('identity', assert => {
    assert.isFunction(structuredClone, 'structuredClone is a function');
    assert.name(structuredClone, 'structuredClone');
  });

  function cloneTest(value, verifyFunc) {
    verifyFunc(value, structuredClone(value));
  }

  // Specialization of cloneTest() for objects, with common asserts.
  function cloneObjectTest(assert, value, verifyFunc) {
    cloneTest(value, (orig, clone) => {
      assert.notEqual(orig, clone, 'clone should have different reference');
      assert.equal(typeof clone, 'object', 'clone should be an object');
      assert.equal(Object.getPrototypeOf(orig), Object.getPrototypeOf(clone), 'clone should have same prototype');
      verifyFunc(orig, clone);
    });
  }

  function cloneFailureTest(assert, value) {
    assert.throws(() => structuredClone(value), typeof DOMException === 'function' ? DOMException : Error);
  }

  //
  // ECMAScript types
  //

  // Primitive values: Undefined, Null, Boolean, Number, BigInt, String
  const booleans = [false, true];
  const numbers = [
    NaN,
    -Infinity,
    -Number.MAX_VALUE,
    -0xFFFFFFFF,
    -0x80000000,
    -0x7FFFFFFF,
    -1,
    -Number.MIN_VALUE,
    -0,
    0,
    1,
    Number.MIN_VALUE,
    0x7FFFFFFF,
    0x80000000,
    0xFFFFFFFF,
    Number.MAX_VALUE,
    Infinity,
  ];
  // FIXME: Crashes
  /* const bigints = [
    -12345678901234567890n,
    -1n,
    0n,
    1n,
    12345678901234567890n,
  ]; */
  const strings = [
    '',
    'this is a sample string',
    'null(\0)',
  ];

  QUnit.test('primitives', assert => {
    [undefined, null].concat(booleans, numbers, /* bigints,*/ strings)
      .forEach(value => cloneTest(value, (orig, clone) => {
        assert.same(orig, clone, 'primitives should be same after cloned');
      }));
  });

  // "Primitive" Objects (Boolean, Number, BigInt, String)
  QUnit.test('primitive objects', assert => {
    [].concat(booleans, numbers, strings)
      .forEach(value => cloneObjectTest(assert, Object(value), (orig, clone) => {
        assert.same(orig.valueOf(), clone.valueOf(), 'primitive wrappers should have same value');
      }));
  });

  // Dates
  QUnit.test('Date', assert => {
    [
      new Date(-1e13),
      new Date(-1e12),
      new Date(-1e9),
      new Date(-1e6),
      new Date(-1e3),
      new Date(0),
      new Date(1e3),
      new Date(1e6),
      new Date(1e9),
      new Date(1e12),
      new Date(1e13),
    ].forEach(value => cloneTest(value, (orig, clone) => {
      assert.notEqual(orig, clone);
      assert.equal(typeof clone, 'object');
      assert.equal(Object.getPrototypeOf(orig), Object.getPrototypeOf(clone));
      assert.equal(orig.valueOf(), clone.valueOf());
    }));
  });

  // Regular Expressions
  QUnit.test('RegExp', assert => {
    [
      new RegExp(),
      /abc/,
      /abc/g,
      /abc/i,
      /abc/gi,
      /abc/,
      /abc/g,
      /abc/i,
      /abc/gi,
      // /abc/giuy, -- Crashes
    ].forEach((value, i) => cloneObjectTest(assert, value, (orig, clone) => {
      assert.equal(orig.toString(), clone.toString(), `regex ${ i }`);
    }));
  });

  // ArrayBuffer
  QUnit.test('ArrayBuffer', assert => { // Crashes
    cloneObjectTest(assert, new Uint8Array([0, 1, 254, 255]).buffer, (orig, clone) => {
      assert.arrayEqual(new Uint8Array(orig), new Uint8Array(clone));
    });
  });

  // TODO SharedArrayBuffer

  // Array Buffer Views
  QUnit.test('ArrayBufferView', assert => {
    [
      new Uint8Array([]),
      new Uint8Array([0, 1, 254, 255]),
      new Uint16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF]),
      new Uint32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]),
      new Int8Array([0, 1, 254, 255]),
      new Int16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF]),
      new Int32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]),
      new Uint8ClampedArray([0, 1, 254, 255]),
      new Float32Array([-Infinity, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, Infinity, NaN]),
      new Float64Array([-Infinity, -Number.MAX_VALUE, -Number.MIN_VALUE, 0,
        Number.MIN_VALUE, Number.MAX_VALUE, Infinity, NaN]),
    ].forEach(value => cloneObjectTest(assert, value, (orig, clone) => {
      assert.arrayEqual(orig, clone);
    }));
  });

  // Map
  QUnit.test('Map', assert => {
    cloneObjectTest(assert, new Map([[1, 2], [3, 4]]), (orig, clone) => {
      assert.deepEqual(orig.keys(), clone.keys());
      assert.deepEqual(orig.values(), clone.values());
    });
  });

  // Set
  QUnit.test('Set', assert => {
    cloneObjectTest(assert, new Set([1, 2, 3, 4]), (orig, clone) => {
      assert.deepEqual(orig.values(), clone.values());
    });
  });

  // Error
  QUnit.test('Error', assert => {
    [
      new Error(),
      new Error('abc', 'def'),
      new EvalError(),
      new EvalError('ghi', 'jkl'),
      new RangeError(),
      new RangeError('ghi', 'jkl'),
      new ReferenceError(),
      new ReferenceError('ghi', 'jkl'),
      new SyntaxError(),
      new SyntaxError('ghi', 'jkl'),
      new TypeError(),
      new TypeError('ghi', 'jkl'),
      new URIError(),
      new URIError('ghi', 'jkl'),
    ].forEach(value => cloneObjectTest(assert, value, (orig, clone) => {
      assert.equal(orig.name, clone.name);
      assert.equal(orig.message, clone.message);
    }));
  });

  // Arrays
  QUnit.test('Array', assert => {
    [
      [],
      [1, 2, 3],
      Object.assign(
        ['foo', 'bar'],
        { 10: true, 11: false, 20: 123, 21: 456, 30: null }),
      Object.assign(
        ['foo', 'bar'],
        { a: true, b: false, foo: 123, bar: 456, '': null }),
    ].forEach((value, i) => cloneObjectTest(assert, value, (orig, clone) => {
      assert.deepEqual(value, clone, `array content should be same: ${ i }`);
      assert.deepEqual(Object.keys(value), Object.keys(clone), `array key should be same: ${ i }`);
      Object.keys(orig).forEach(key => {
        assert.equal(orig[key], clone[key], `Property ${ key }`);
      });
    }));
  });

  // Objects
  QUnit.test('Object', assert => {
    cloneObjectTest(assert, { foo: true, bar: false }, (orig, clone) => {
      assert.deepEqual(Object.keys(orig), Object.keys(clone));
      Object.keys(orig).forEach(key => {
        assert.equal(orig[key], clone[key], `Property ${ key }`);
      });
    });
  });

  //
  // [Serializable] Platform objects
  //

  // TODO: Test these additional interfaces:
  // * DOMQuad
  // * DOMException
  // * RTCCertificate

  // Geometry types
  // FIXME: PhantomJS Can't run this test due to unsupported API.
  QUnit.test.skip('Geometry types', assert => {
    [
      new DOMMatrix(),
      new DOMMatrixReadOnly(),
      new DOMPoint(),
      new DOMPointReadOnly(),
      new DOMRect(),
      new DOMRectReadOnly(),
    ].forEach(value => cloneObjectTest(assert, value, (orig, clone) => {
      Object.keys(Object.getPrototypeOf(orig)).forEach(key => {
        assert.equal(orig[key], clone[key], `Property ${ key }`);
      });
    }));
  });

  // ImageData
  // FIXME: PhantomJS Can't run this test due to unsupported API.
  QUnit.test.skip('ImageData', assert => { // Crashes
    const imageData = new ImageData(8, 8);
    for (let i = 0; i < 256; ++i) {
      imageData.data[i] = i;
    }
    cloneObjectTest(assert, imageData, (orig, clone) => {
      assert.equal(orig.width, clone.width);
      assert.equal(orig.height, clone.height);
      assert.arrayEqual(orig.data, clone.data);
    });
  });

  // Blob
  QUnit.test('Blob', assert => {
    cloneObjectTest(
      assert,
      new Blob(['This is a test.'], { type: 'a/b' }),
      (orig, clone) => {
        assert.equal(orig.size, clone.size);
        assert.equal(orig.type, clone.type);
        // assert.equal(await orig.text(), await clone.text());
      });
  });

  // File
  // FIXME: PhantomJS Can't run this test due to unsupported API.
  QUnit.test.skip('File', assert => {
    cloneObjectTest(
      assert,
      new File(['This is a test.'], 'foo.txt', { type: 'c/d' }),
      (orig, clone) => {
        assert.equal(orig.size, clone.size);
        assert.equal(orig.type, clone.type);
        assert.equal(orig.name, clone.name);
        assert.equal(orig.lastModified, clone.lastModified);
        // assert.equal(await orig.text(), await clone.text());
      });
  });

  // FileList - exposed in Workers, but not constructable.
  QUnit.test('FileList', assert => {
    if ('document' in self) {
      // TODO: Test with populated list.
      cloneObjectTest(
        assert,
        Object.assign(document.createElement('input'),
          { type: 'file', multiple: true }).files,
        (orig, clone) => {
          assert.equal(orig.length, clone.length);
        });
    }
  });

  //
  // Non-serializable types
  //
  QUnit.test('Non-serializable types', assert => {
    [
      // ECMAScript types
      function () { return 1; },
      Symbol('desc'),

      // Non-[Serializable] platform objects
      self,
      new Event(''),
      new MessageChannel(),
    ].forEach(cloneFailureTest.bind(null, assert));
  });
});
