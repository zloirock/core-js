// Originally from: https://github.com/web-platform-tests/wpt/blob/4b35e758e2fc4225368304b02bcec9133965fd1a/IndexedDB/structured-clone.any.js
// Copyright © web-platform-tests contributors. Available under the 3-Clause BSD License.
/* eslint-disable es/no-error-cause, es/no-typed-arrays -- safe */
import { GLOBAL, NODE, BUN } from '../helpers/constants.js';
import { bufferToArray, fromSource } from '../helpers/helpers.js';

import structuredClone from 'core-js-pure/stable/structured-clone';
import from from 'core-js-pure/es/array/from';
import assign from 'core-js-pure/es/object/assign';
import keys from 'core-js-pure/es/object/keys';
import Symbol from 'core-js-pure/es/symbol';
import Map from 'core-js-pure/es/map';
import Set from 'core-js-pure/es/set';
import AggregateError from 'core-js-pure/es/aggregate-error';
import DOMException from 'core-js-pure/stable/dom-exception';

const { getPrototypeOf } = Object;

QUnit.module('structuredClone', () => {
  QUnit.test('identity', assert => {
    assert.isFunction(structuredClone, 'structuredClone is a function');
    assert.name(structuredClone, 'structuredClone');
    assert.arity(structuredClone, 1);
    assert.throws(() => structuredClone(), 'throws without arguments');
    assert.same(structuredClone(1, null), 1, 'null as options');
    assert.same(structuredClone(1, undefined), 1, 'undefined as options');
  });

  function cloneTest(value, verifyFunc) {
    verifyFunc(value, structuredClone(value));
  }

  // Specialization of cloneTest() for objects, with common asserts.
  function cloneObjectTest(assert, value, verifyFunc) {
    cloneTest(value, (orig, clone) => {
      assert.notSame(orig, clone, 'clone should have different reference');
      assert.same(typeof clone, 'object', 'clone should be an object');
      // https://github.com/qunitjs/node-qunit/issues/146
      assert.true(getPrototypeOf(orig) === getPrototypeOf(clone), 'clone should have same prototype');
      verifyFunc(orig, clone);
    });
  }

  // ECMAScript types

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

  const bigints = fromSource(`[
    -12345678901234567890n,
    -1n,
    0n,
    1n,
    12345678901234567890n,
  ]`) || [];

  const strings = [
    '',
    'this is a sample string',
    'null(\0)',
  ];

  QUnit.test('primitives', assert => {
    const primitives = [undefined, null, ...booleans, ...numbers, ...bigints, ...strings];

    for (const value of primitives) cloneTest(value, (orig, clone) => {
      assert.same(orig, clone, 'primitives should be same after cloned');
    });
  });

  // "Primitive" Objects (Boolean, Number, BigInt, String)
  QUnit.test('primitive objects', assert => {
    const primitives = [...booleans, ...numbers, ...bigints, ...strings];

    for (const value of primitives) cloneObjectTest(assert, Object(value), (orig, clone) => {
      assert.same(orig.valueOf(), clone.valueOf(), 'primitive wrappers should have same value');
    });
  });

  // Dates
  QUnit.test('Date', assert => {
    const dates = [
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
    ];

    for (const date of dates) cloneTest(date, (orig, clone) => {
      assert.notSame(orig, clone);
      assert.same(typeof clone, 'object');
      assert.same(getPrototypeOf(orig), getPrototypeOf(clone));
      assert.same(orig.valueOf(), clone.valueOf());
    });
  });

  // Regular Expressions
  QUnit.test('RegExp', assert => {
    const regexes = [
      new RegExp(),
      /abc/,
      /abc/g,
      /abc/i,
      /abc/gi,
      /abc/,
      /abc/g,
      /abc/i,
      /abc/gi,
    ];

    const giuy = fromSource('/abc/giuy');
    if (giuy) regexes.push(giuy);

    for (const regex of regexes) cloneObjectTest(assert, regex, (orig, clone) => {
      assert.same(orig.toString(), clone.toString(), `regex ${ regex }`);
    });
  });

  if (fromSource('ArrayBuffer.prototype.slice || DataView')) {
    // ArrayBuffer
    if (typeof Uint8Array == 'function') QUnit.test('ArrayBuffer', assert => { // Crashes
      cloneObjectTest(assert, new Uint8Array([0, 1, 254, 255]).buffer, (orig, clone) => {
        assert.arrayEqual(new Uint8Array(orig), new Uint8Array(clone));
      });
    });

    // TODO SharedArrayBuffer

    // Array Buffer Views
    if (typeof Int8Array != 'undefined') {
      QUnit.test('%TypedArray%', assert => {
        const arrays = [
          new Uint8Array([]),
          new Uint8Array([0, 1, 254, 255]),
          new Uint16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF]),
          new Uint32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]),
          new Int8Array([0, 1, 254, 255]),
          new Int16Array([0x0000, 0x0001, 0xFFFE, 0xFFFF]),
          new Int32Array([0x00000000, 0x00000001, 0xFFFFFFFE, 0xFFFFFFFF]),
          new Float32Array([-Infinity, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, Infinity, NaN]),
          new Float64Array([-Infinity, -Number.MAX_VALUE, -Number.MIN_VALUE, 0, Number.MIN_VALUE, Number.MAX_VALUE, Infinity, NaN]),
        ];

        if (typeof Uint8ClampedArray != 'undefined') {
          arrays.push(new Uint8ClampedArray([0, 1, 254, 255]));
        }

        for (const array of arrays) cloneObjectTest(assert, array, (orig, clone) => {
          assert.arrayEqual(orig, clone);
        });
      });

      if (typeof DataView != 'undefined') QUnit.test('DataView', assert => {
        const array = new Int8Array([1, 2, 3, 4]);
        const view = new DataView(array.buffer);

        cloneObjectTest(assert, array, (orig, clone) => {
          assert.same(orig.byteLength, clone.byteLength);
          assert.same(orig.byteOffset, clone.byteOffset);
          assert.arrayEqual(new Int8Array(view.buffer), array);
        });
      });
    }

    if ('resizable' in ArrayBuffer.prototype) {
      QUnit.test('Resizable ArrayBuffer', assert => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8];

        // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
        let buffer = new ArrayBuffer(8, { maxByteLength: 16 });
        new Int8Array(buffer).set(array);
        let copy = structuredClone(buffer);
        assert.arrayEqual(bufferToArray(copy), array, 'resizable-ab-1');
        assert.true(copy.resizable, 'resizable-ab-1');

        buffer = new ArrayBuffer(8);
        new Int8Array(buffer).set(array);
        copy = structuredClone(buffer);
        assert.arrayEqual(bufferToArray(copy), array, 'non-resizable-ab-1');
        assert.false(copy.resizable, 'non-resizable-ab-1');

        // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
        buffer = new ArrayBuffer(8, { maxByteLength: 16 });
        let tarray = new Int8Array(buffer);
        tarray.set(array);
        copy = structuredClone(tarray).buffer;
        assert.arrayEqual(bufferToArray(copy), array, 'resizable-ab-2');
        assert.true(copy.resizable, 'resizable-ab-2');

        buffer = new ArrayBuffer(8);
        tarray = new Int8Array(buffer);
        tarray.set(array);
        copy = structuredClone(tarray).buffer;
        assert.arrayEqual(bufferToArray(copy), array, 'non-resizable-ab-2');
        assert.false(copy.resizable, 'non-resizable-ab-2');
      });
    }
  }

  // Map
  QUnit.test('Map', assert => {
    cloneObjectTest(assert, new Map([[1, 2], [3, 4]]), (orig, clone) => {
      assert.deepEqual(from(orig.keys()), from(clone.keys()));
      assert.deepEqual(from(orig.values()), from(clone.values()));
    });
  });

  // Set
  QUnit.test('Set', assert => {
    cloneObjectTest(assert, new Set([1, 2, 3, 4]), (orig, clone) => {
      assert.deepEqual(from(orig.values()), from(clone.values()));
    });
  });

  // Error
  QUnit.test('Error', assert => {
    const errors = [
      ['Error', new Error()],
      ['Error', new Error('msg', { cause: 42 })],
      ['EvalError', new EvalError()],
      ['EvalError', new EvalError('msg', { cause: 42 })],
      ['RangeError', new RangeError()],
      ['RangeError', new RangeError('msg', { cause: 42 })],
      ['ReferenceError', new ReferenceError()],
      ['ReferenceError', new ReferenceError('msg', { cause: 42 })],
      ['SyntaxError', new SyntaxError()],
      ['SyntaxError', new SyntaxError('msg', { cause: 42 })],
      ['TypeError', new TypeError()],
      ['TypeError', new TypeError('msg', { cause: 42 })],
      ['URIError', new URIError()],
      ['URIError', new URIError('msg', { cause: 42 })],
      ['AggregateError', new AggregateError([1, 2])],
      ['AggregateError', new AggregateError([1, 2], 'msg', { cause: 42 })],
    ];

    const compile = fromSource('WebAssembly.CompileError()');
    const link = fromSource('WebAssembly.LinkError()');
    const runtime = fromSource('WebAssembly.RuntimeError()');

    if (compile && compile.name === 'CompileError') errors.push(['CompileError', compile]);
    if (link && link.name === 'LinkError') errors.push(['LinkError', link]);
    if (runtime && runtime.name === 'RuntimeError') errors.push(['RuntimeError', runtime]);

    for (const [name, error] of errors) cloneObjectTest(assert, error, (orig, clone) => {
      assert.same(orig.constructor, clone.constructor, `${ name }#constructor`);
      assert.same(orig.name, clone.name, `${ name }#name`);
      assert.same(orig.message, clone.message, `${ name }#message`);
      assert.same(orig.stack, clone.stack, `${ name }#stack`);
      assert.same(orig.cause, clone.cause, `${ name }#cause`);
      assert.deepEqual(orig.errors, clone.errors, `${ name }#errors`);
    });
  });

  // Arrays
  QUnit.test('Array', assert => {
    const arrays = [
      [],
      [1, 2, 3],
      Array(1),
      assign(
        ['foo', 'bar'],
        { 10: true, 11: false, 20: 123, 21: 456, 30: null }),
      assign(
        ['foo', 'bar'],
        { a: true, b: false, foo: 123, bar: 456, '': null }),
    ];

    for (const array of arrays) cloneObjectTest(assert, array, (orig, clone) => {
      assert.deepEqual(orig, clone, `array content should be same: ${ array }`);
      assert.deepEqual(orig.length, clone.length, `array length should be same: ${ array }`);
      assert.deepEqual(keys(orig), keys(clone), `array key should be same: ${ array }`);
      for (const key of keys(orig)) {
        assert.same(orig[key], clone[key], `Property ${ key }`);
      }
    });
  });

  // Objects
  QUnit.test('Object', assert => {
    cloneObjectTest(assert, { foo: true, bar: false }, (orig, clone) => {
      assert.deepEqual(keys(orig), keys(clone));
      for (const key of keys(orig)) {
        assert.same(orig[key], clone[key], `Property ${ key }`);
      }
    });
  });

  // [Serializable] Platform objects

  // Geometry types
  if (typeof DOMMatrix == 'function') {
    QUnit.test('Geometry types, DOMMatrix', assert => {
      cloneObjectTest(assert, new DOMMatrix(), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (typeof DOMMatrixReadOnly == 'function' && typeof DOMMatrixReadOnly.fromMatrix == 'function') {
    QUnit.test('Geometry types, DOMMatrixReadOnly', assert => {
      cloneObjectTest(assert, new DOMMatrixReadOnly(), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (typeof DOMPoint == 'function') {
    QUnit.test('Geometry types, DOMPoint', assert => {
      cloneObjectTest(assert, new DOMPoint(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (typeof DOMPointReadOnly == 'function' && typeof DOMPointReadOnly.fromPoint == 'function') {
    QUnit.test('Geometry types, DOMPointReadOnly', assert => {
      cloneObjectTest(assert, new DOMPointReadOnly(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (typeof DOMQuad == 'function' && typeof DOMPoint == 'function') {
    QUnit.test('Geometry types, DOMQuad', assert => {
      cloneObjectTest(assert, new DOMQuad(
        new DOMPoint(1, 2, 3, 4),
        new DOMPoint(2, 2, 3, 4),
        new DOMPoint(1, 3, 3, 4),
        new DOMPoint(1, 2, 4, 4),
      ), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.deepEqual(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (fromSource('new DOMRect(1, 2, 3, 4)')) {
    QUnit.test('Geometry types, DOMRect', assert => {
      cloneObjectTest(assert, new DOMRect(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  if (typeof DOMRectReadOnly == 'function' && typeof DOMRectReadOnly.fromRect == 'function') {
    QUnit.test('Geometry types, DOMRectReadOnly', assert => {
      cloneObjectTest(assert, new DOMRectReadOnly(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Safari 8- does not support `{ colorSpace }` option
  if (fromSource('new ImageData(new ImageData(8, 8).data, 8, 8, { colorSpace: new ImageData(8, 8).colorSpace })')) {
    QUnit.test('ImageData', assert => {
      const imageData = new ImageData(8, 8);
      for (let i = 0; i < 256; ++i) {
        imageData.data[i] = i;
      }
      cloneObjectTest(assert, imageData, (orig, clone) => {
        assert.same(orig.width, clone.width);
        assert.same(orig.height, clone.height);
        assert.same(orig.colorSpace, clone.colorSpace);
        assert.arrayEqual(orig.data, clone.data);
      });
    });
  }

  if (fromSource('new Blob(["test"])')) QUnit.test('Blob', assert => {
    cloneObjectTest(
      assert,
      new Blob(['This is a test.'], { type: 'a/b' }),
      (orig, clone) => {
        assert.same(orig.size, clone.size);
        assert.same(orig.type, clone.type);
        // TODO: async
        // assert.same(await orig.text(), await clone.text());
      });
  });

  QUnit.test('DOMException', assert => {
    const errors = [
      new DOMException(),
      new DOMException('foo', 'DataCloneError'),
    ];

    for (const error of errors) cloneObjectTest(assert, error, (orig, clone) => {
      assert.same(orig.name, clone.name);
      assert.same(orig.message, clone.message);
      assert.same(orig.code, clone.code);
      assert.same(orig.stack, clone.stack);
    });
  });

  // https://github.com/oven-sh/bun/issues/11696
  if (!BUN && fromSource('new File(["test"], "foo.txt")')) QUnit.test('File', assert => {
    cloneObjectTest(
      assert,
      new File(['This is a test.'], 'foo.txt', { type: 'c/d' }),
      (orig, clone) => {
        assert.same(orig.size, clone.size);
        assert.same(orig.type, clone.type);
        assert.same(orig.name, clone.name);
        assert.same(orig.lastModified, clone.lastModified);
        // TODO: async
        // assert.same(await orig.text(), await clone.text());
      });
  });

  // FileList
  if (fromSource('new File(["test"], "foo.txt")') && fromSource('new DataTransfer() && "items" in DataTransfer.prototype')) QUnit.test('FileList', assert => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['test'], 'foo.txt'));
    cloneObjectTest(
      assert,
      transfer.files,
      (orig, clone) => {
        assert.same(1, clone.length);
        assert.same(orig[0].size, clone[0].size);
        assert.same(orig[0].type, clone[0].type);
        assert.same(orig[0].name, clone[0].name);
        assert.same(orig[0].lastModified, clone[0].lastModified);
      },
    );
  });

  // Non-serializable types
  QUnit.test('Non-serializable types', assert => {
    const nons = [
      function () { return 1; },
      Symbol('desc'),
      GLOBAL,
    ];

    const event = fromSource('new Event("")');
    const port = fromSource('new MessageChannel().port1');

    // NodeJS events are simple objects
    if (event && !NODE) nons.push(event);
    if (port) nons.push(port);

    for (const it of nons) {
      // native NodeJS `structuredClone` throws a `TypeError` on transferable non-serializable instead of `DOMException`
      // https://github.com/nodejs/node/issues/40841
      assert.throws(() => structuredClone(it));
    }
  });
});
