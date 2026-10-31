// Originally from: https://github.com/web-platform-tests/wpt/blob/4b35e758e2fc4225368304b02bcec9133965fd1a/IndexedDB/structured-clone.any.js
// Copyright © web-platform-tests contributors. Available under the 3-Clause BSD License.
import { GLOBAL, NODE, BUN, DENO, DENO_VERSION } from '../helpers/constants.js';
import { bufferToArray, fromSource } from '../helpers/helpers.js';

const { from } = Array;
const { assign, create: objectCreate, defineProperty, getPrototypeOf, keys } = Object;

QUnit.module('structuredClone', () => {
  QUnit.test('identity', assert => {
    assert.isFunction(structuredClone, 'structuredClone is a function');
    assert.name(structuredClone, 'structuredClone');
    assert.arity(structuredClone, 1);
    if (!NODE) assert.looksNative(structuredClone);
    assert.throws(() => structuredClone(), 'throws without arguments');
    assert.same(structuredClone(1, null), 1, 'null as options');
    assert.same(structuredClone(1, undefined), 1, 'undefined as options');
  });

  function cloneTest(value, verifyFunc) {
    verifyFunc(value, structuredClone(value));
  }

  function isTransferError(error) {
    // Node.js 17-20 uses TypeError for invalid transfer-list entries.
    return error.name === 'DataCloneError' || NODE && error.name === 'TypeError' && error.code === 'ERR_INVALID_TRANSFER_OBJECT';
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
    // Deno 1.11-1.12 PerformanceMark cannot clone boxed strings.
    const boxedStrings = DENO_VERSION === 111 || DENO_VERSION === 112 ? [] : strings;
    const primitives = [...booleans, ...numbers, ...bigints, ...boxedStrings];

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

    if (GLOBAL.WebAssembly?.Memory) QUnit.test('empty WebAssembly memory', assert => {
      const memory = new GLOBAL.WebAssembly.Memory({ initial: 0 });
      const { buffer } = memory;
      const view = new Uint8Array(buffer);
      const clone = structuredClone(buffer);
      assert.notSame(clone, buffer, 'buffer copied');
      assert.same(clone.byteLength, 0, 'empty buffer');
      assert.same(structuredClone(view).length, 0, 'empty view');
      assert.same(new DataView(buffer).byteLength, 0, 'source is attached');
      // Node 10.24 and Chrome 67-73 keep the old empty buffer usable after growth.
      // Check detachment after growing non-empty memory instead.
      memory.grow(1);
      const nonEmptyBuffer = memory.buffer;
      const nonEmptyView = new Uint8Array(nonEmptyBuffer);
      memory.grow(1);
      assert.throws(() => structuredClone(nonEmptyBuffer), error => error.name === 'DataCloneError', 'old buffer is detached');
      assert.throws(() => structuredClone(nonEmptyView), error => error.name === 'DataCloneError', 'old view is detached');
    });

    const SharedArrayBuffer = fromSource('SharedArrayBuffer');
    // Deno 1.11 PerformanceMark rejects SharedArrayBuffer.
    if (SharedArrayBuffer && DENO_VERSION !== 111) QUnit.test('SharedArrayBuffer', assert => {
      const buffer = new SharedArrayBuffer(8);
      const view = new Uint8Array(buffer);
      const copy = structuredClone({ buffer, view });
      assert.notSame(copy.view, view, 'view copied');
      assert.same(copy.view.buffer, copy.buffer, 'shared buffer reference');
      new Uint8Array(copy.buffer)[0] = 73;
      assert.same(view[0], 73, 'memory stays shared');
    });

    if (SharedArrayBuffer && 'growable' in SharedArrayBuffer.prototype) {
      QUnit.test('Growable SharedArrayBuffer views', assert => {
        for (const C of [Uint8Array, Uint16Array, DataView]) {
          for (const bufferFirst of [false, true]) {
            const buffer = new SharedArrayBuffer(8, { maxByteLength: 16 });
            const tracking = new C(buffer, 2);
            const fixed = new C(buffer, 2, 6 / (C.BYTES_PER_ELEMENT || 1));
            const emptyTracking = new C(buffer, 8);
            const emptyFixed = new C(buffer, 8, 0);
            const graph = bufferFirst
              ? { buffer, tracking, fixed, emptyTracking, emptyFixed }
              : { tracking, fixed, emptyTracking, emptyFixed, buffer };
            let reads = 0;
            defineProperty(graph, 'again', {
              enumerable: true,
              get() {
                reads++;
                return tracking;
              },
            });
            graph.self = graph;
            graph.error = new AggregateError([tracking], 'shared', { cause: fixed });
            graph.map = new Map([['first', 1], [tracking, buffer], [buffer, fixed], ['last', tracking]]);
            graph.set = new Set(['first', tracking, buffer, fixed]);
            graph.set.add(graph.set);

            const copy = structuredClone(graph);
            assert.same(buffer.byteLength, 8, 'cloning does not grow the source');
            assert.true(copy.buffer instanceof SharedArrayBuffer, 'shared buffer type preserved');
            assert.same(copy.again, copy.tracking, 'repeated view reference');
            assert.same(reads, 1, 'source getter runs once');
            assert.same(copy.self, copy, 'circular reference');
            assert.same(copy.error.errors[0], copy.tracking, 'AggregateError shares the tracking view');
            assert.same(copy.error.cause, copy.fixed, 'AggregateError shares the fixed view');
            for (const key of ['tracking', 'fixed', 'emptyTracking', 'emptyFixed']) {
              assert.same(copy[key].buffer, copy.buffer, `${ key } shares the cloned buffer`);
              assert.same(copy[key].byteOffset, graph[key].byteOffset, `${ key } offset`);
            }
            assert.arrayEqual(from(copy.map.keys()), ['first', copy.tracking, copy.buffer, 'last'], 'Map key order');
            assert.same(copy.map.get(copy.tracking), copy.buffer, 'Map value reference');
            assert.same(copy.map.get(copy.buffer), copy.fixed, 'Map buffer key');
            assert.arrayEqual(from(copy.set), ['first', copy.tracking, copy.buffer, copy.fixed, copy.set], 'Set order and cycle');
            copy.buffer.grow(16);
            assert.same(copy.tracking.byteLength, 14, 'tracking view grows');
            assert.same(copy.fixed.byteLength, 6, 'fixed view keeps its length');
            assert.same(copy.emptyTracking.byteLength, 8, 'empty tracking view grows');
            assert.same(copy.emptyFixed.byteLength, 0, 'empty fixed view stays empty');
            assert.same(buffer.byteLength, 16, 'growth stays shared');
            new Uint8Array(copy.buffer)[0] = 73;
            assert.same(new Uint8Array(buffer)[0], 73, 'writes stay shared');
          }
        }
      });

      QUnit.test('Empty growable SharedArrayBuffer views', assert => {
        for (const C of [Uint8Array, Uint16Array, DataView]) {
          for (const maxByteLength of [0, 8]) {
            const buffer = new SharedArrayBuffer(0, { maxByteLength });
            const tracking = new C(buffer);
            const fixed = new C(buffer, 0, 0);
            const copy = structuredClone({ buffer, tracking, fixed });
            assert.same(copy.tracking.buffer, copy.buffer, 'tracking buffer reference');
            assert.same(copy.fixed.buffer, copy.buffer, 'fixed buffer reference');
            copy.buffer.grow(maxByteLength);
            assert.same(copy.tracking.byteLength, maxByteLength, 'tracking view follows the buffer');
            assert.same(copy.fixed.byteLength, 0, 'fixed view stays empty');
          }
        }
      });
    }

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

        cloneObjectTest(assert, view, (orig, clone) => {
          assert.same(orig.byteLength, clone.byteLength);
          assert.same(orig.byteOffset, clone.byteOffset);
          assert.arrayEqual(new Int8Array(orig.buffer), new Int8Array(clone.buffer));
        });
      });
    }

    if ('resizable' in ArrayBuffer.prototype) {
      QUnit.test('Resizable ArrayBuffer views', assert => {
        const constructors = [Uint8Array, Uint16Array, DataView];
        const BigInt64Array = fromSource('BigInt64Array');
        if (BigInt64Array) constructors.push(BigInt64Array);

        for (const C of constructors) {
          const bytes = C.BYTES_PER_ELEMENT || 1;
          for (const bufferFirst of [false, true]) {
            const buffer = new ArrayBuffer(16, { maxByteLength: 32 });
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            new Uint8Array(buffer).set(data);
            const tracking = new C(buffer, 8);
            const fixed = new C(buffer, 8, 8 / bytes);
            const emptyTracking = new C(buffer, 16);
            const emptyFixed = new C(buffer, 16, 0);
            const graph = bufferFirst
              ? { buffer, tracking, fixed, emptyTracking, emptyFixed }
              : { tracking, fixed, emptyTracking, emptyFixed, buffer };
            graph.again = tracking;
            graph.self = graph;
            graph.error = new AggregateError([tracking], 'message', { cause: fixed });

            const copy = structuredClone(graph);
            assert.same(copy.again, copy.tracking, 'repeated view reference');
            assert.same(copy.self, copy, 'circular reference');
            assert.same(copy.error.errors[0], copy.tracking, 'AggregateError shares the tracking view');
            assert.same(copy.error.cause, copy.fixed, 'AggregateError shares the fixed view');
            for (const key of ['tracking', 'fixed', 'emptyTracking', 'emptyFixed']) {
              assert.same(copy[key].buffer, copy.buffer, `${ key } shares the cloned buffer`);
              assert.same(copy[key].byteOffset, graph[key].byteOffset, `${ key } offset`);
            }
            assert.arrayEqual(bufferToArray(copy.buffer), data, 'cloned bytes');
            copy.buffer.resize(32);
            assert.same(copy.tracking.byteLength, 24, 'tracking view grows');
            assert.same(copy.fixed.byteLength, 8, 'fixed view keeps its length');
            assert.same(copy.emptyTracking.byteLength, 16, 'empty tracking view grows');
            assert.same(copy.emptyFixed.byteLength, 0, 'empty fixed view stays empty');
            copy.buffer.resize(8);
            assert.same(copy.tracking.byteLength, 0, 'tracking view shrinks to an empty view');
            copy.buffer.resize(16);
            assert.same(copy.fixed.byteLength, 8, 'fixed view returns in bounds');
            assert.same(buffer.byteLength, 16, 'source length is unchanged');
            assert.arrayEqual(bufferToArray(buffer), data, 'source bytes are unchanged');

            const standalone = structuredClone(tracking);
            standalone.buffer.resize(32);
            assert.same(standalone.byteLength, 24, 'standalone tracking view grows');
          }
        }
      });

      QUnit.test('Empty resizable ArrayBuffer views', assert => {
        for (const C of [Uint8Array, Uint16Array, DataView]) {
          for (const maxByteLength of [0, 16]) {
            const buffer = new ArrayBuffer(0, { maxByteLength });
            const tracking = new C(buffer);
            const fixed = new C(buffer, 0, 0);
            const copy = structuredClone({ buffer, tracking, fixed });
            assert.same(copy.tracking.buffer, copy.buffer, 'tracking view shares the cloned buffer');
            assert.same(copy.fixed.buffer, copy.buffer, 'fixed view shares the cloned buffer');
            copy.buffer.resize(maxByteLength);
            assert.same(copy.tracking.byteLength, maxByteLength, 'tracking view follows the buffer');
            assert.same(copy.fixed.byteLength, 0, 'fixed view stays empty');
          }
        }
      });

      QUnit.test('Out-of-bounds resizable ArrayBuffer views', assert => {
        for (const C of [Uint8Array, Uint16Array, DataView]) {
          const bytes = C.BYTES_PER_ELEMENT || 1;
          const buffer = new ArrayBuffer(16, { maxByteLength: 32 });
          const views = [
            new C(buffer, 0, 16 / bytes),
            new C(buffer, 8, 8 / bytes),
            new C(buffer, 8),
            new C(buffer, 16, 0),
          ];
          buffer.resize(4);
          for (const view of views) {
            assert.throws(() => structuredClone(view), error => error.name === 'DataCloneError', 'out-of-bounds view');
            assert.throws(() => structuredClone({ buffer, view }), error => error.name === 'DataCloneError', 'buffer cloned first');
            assert.throws(() => structuredClone(view, { transfer: [buffer] }), error => error.name === 'DataCloneError', 'out-of-bounds transfer');
            assert.same(buffer.byteLength, 4, 'failed transfer preserves the source buffer');
          }
        }
      });

      if (ArrayBuffer.prototype.transfer) QUnit.test('Resizable ArrayBuffer views with transfer', assert => {
        for (const C of [Uint8Array, Uint16Array, DataView]) {
          const buffer = new ArrayBuffer(8, { maxByteLength: 16 });
          const tracking = new C(buffer);
          const fixed = new C(buffer, 0, 8 / (C.BYTES_PER_ELEMENT || 1));
          const copy = structuredClone({ buffer, tracking, fixed }, { transfer: [buffer] });
          assert.same(buffer.byteLength, 0, 'source buffer detached');
          assert.same(copy.tracking.buffer, copy.buffer, 'tracking view shares the transferred buffer');
          assert.same(copy.fixed.buffer, copy.buffer, 'fixed view shares the transferred buffer');
          copy.buffer.resize(16);
          assert.same(copy.tracking.byteLength, 16, 'tracking view grows');
          assert.same(copy.fixed.byteLength, 8, 'fixed view keeps its length');
          assert.throws(() => structuredClone(tracking), error => error.name === 'DataCloneError', 'detached tracking view');
          assert.throws(() => structuredClone(fixed), error => error.name === 'DataCloneError', 'detached fixed view');
        }
      });
      QUnit.test('Resizable ArrayBuffer', assert => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8];

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

  QUnit.test('Map entries changed during cloning', assert => {
    for (const mutateKey of [false, true]) {
      const map = new Map();
      const shared = { value: 1 };
      const order = [];
      const mutator = defineProperty({}, 'value', {
        enumerable: true,
        get() {
          order.push('mutator');
          map.delete('deleted');
          map.set('updated', 'new');
          map.set('added', 'late');
          shared.value = 2;
          return map;
        },
      });
      const other = defineProperty({}, 'value', {
        enumerable: true,
        get() {
          order.push('other');
          return shared;
        },
      });
      map.set(mutateKey ? mutator : other, mutateKey ? other : mutator);
      map.set('deleted', shared);
      map.set('updated', shared);
      map.set(map, shared);

      const copy = structuredClone(map);
      const entries = from(copy);
      const copiedMutator = entries[0][mutateKey ? 0 : 1];
      const copiedOther = entries[0][mutateKey ? 1 : 0];
      assert.arrayEqual(from(copy.keys()), [entries[0][0], 'deleted', 'updated', copy], 'entry snapshot and order');
      assert.same(copiedMutator.value, copy, 'circular reference preserved');
      assert.same(copy.get('deleted'), copiedOther.value, 'deleted value retains its reference');
      assert.same(copy.get('updated'), copiedOther.value, 'replaced value retains its reference');
      assert.same(copy.get(copy), copiedOther.value, 'self key retains its value');
      assert.same(copiedOther.value.value, mutateKey ? 2 : 1, 'values are cloned when visited');
      assert.arrayEqual(order, mutateKey ? ['mutator', 'other'] : ['other', 'mutator'], 'keys are cloned before values');
    }
  });

  QUnit.test('Set entries changed during cloning', assert => {
    for (const clear of [false, true]) {
      const set = new Set();
      const shared = { value: 1 };
      let reads = 0;
      const mutator = defineProperty({}, 'value', {
        enumerable: true,
        get() {
          reads++;
          if (clear) set.clear();
          else set.delete(shared);
          set.add('late');
          shared.value = 2;
          return set;
        },
      });
      set.add(mutator);
      set.add(shared);
      set.add(set);

      const copy = structuredClone(set);
      const entries = from(copy);
      assert.same(copy.size, 3, 'entry snapshot size');
      assert.same(entries[0].value, copy, 'circular reference preserved');
      assert.deepEqual(entries[1], { value: 2 }, 'deleted value is cloned when visited');
      assert.notSame(entries[1], shared, 'deleted value is copied');
      assert.same(entries[2], copy, 'self entry preserves its position');
      assert.false(copy.has('late'), 'added entry is ignored');
      assert.same(reads, 1, 'getter runs once');
    }
  });

  // Error
  QUnit.test('Error', assert => {
    const errors = [
      ['Error', new Error(), ''],
      ['Error', new Error('msg', { cause: 42 }), 'msg'],
      ['EvalError', new EvalError(), ''],
      ['EvalError', new EvalError('msg', { cause: 42 }), 'msg'],
      ['RangeError', new RangeError(), ''],
      ['RangeError', new RangeError('msg', { cause: 42 }), 'msg'],
      ['ReferenceError', new ReferenceError(), ''],
      ['ReferenceError', new ReferenceError('msg', { cause: 42 }), 'msg'],
      ['SyntaxError', new SyntaxError(), ''],
      ['SyntaxError', new SyntaxError('msg', { cause: 42 }), 'msg'],
      ['TypeError', new TypeError(), ''],
      ['TypeError', new TypeError('msg', { cause: 42 }), 'msg'],
      ['URIError', new URIError(), ''],
      ['URIError', new URIError('msg', { cause: 42 }), 'msg'],
      ['AggregateError', new AggregateError([1, 2]), ''],
      ['AggregateError', new AggregateError([1, 2], 'msg', { cause: 42 }), 'msg'],
    ];

    const compile = fromSource('WebAssembly.CompileError()');
    const link = fromSource('WebAssembly.LinkError()');
    const runtime = fromSource('WebAssembly.RuntimeError()');

    if (compile && compile.name === 'CompileError') errors.push(['CompileError', compile, '']);
    if (link && link.name === 'LinkError') errors.push(['LinkError', link, '']);
    if (runtime && runtime.name === 'RuntimeError') errors.push(['RuntimeError', runtime, '']);

    for (const [name, error, message] of errors) cloneObjectTest(assert, error, (orig, clone) => {
      assert.same(orig.constructor, clone.constructor, `${ name }#constructor`);
      assert.same(orig.name, clone.name, `${ name }#name`);
      assert.same(orig.message, message, `${ name }#source message`);
      assert.same(clone.message, message, `${ name }#message`);
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

  QUnit.test('Object properties changed during cloning', assert => {
    // Firefox 4-6 report the inherited getter as own after deleting the shadowing property.
    for (const inherited of [false, true]) {
      const prototype = {};
      let inheritedReads = 0;
      let reads = 0;
      if (inherited) defineProperty(prototype, 'deleted', {
        get() {
          inheritedReads++;
          return 'inherited';
        },
      });
      const object = objectCreate(prototype);
      defineProperty(object, 'first', {
        enumerable: true,
        get() {
          reads++;
          delete object.deleted;
          delete object.replaced;
          object.replaced = 3;
          object.added = 4;
          defineProperty(object, 'hidden', { enumerable: false });
          return 1;
        },
      });
      defineProperty(object, 'deleted', { value: 2, enumerable: true, configurable: true });
      object.replaced = 2;
      object.hidden = 5;

      const copy = structuredClone(object);
      assert.deepEqual(copy, { first: 1, replaced: 3, hidden: 5 }, 'deleted and added properties are ignored');
      assert.arrayEqual(keys(copy), ['first', 'replaced', 'hidden'], 'original key order and enumerability');
      assert.same(inheritedReads, 0, 'inherited getter is not called');
      assert.same(reads, 1, 'own getter runs once');
    }
  });

  QUnit.test('Array properties changed during cloning', assert => {
    const array = [0, 1];
    let reads = 0;
    // Old Firefox enumerates data indices before accessor indices, so keep both as accessors.
    defineProperty(array, '0', {
      enumerable: true,
      get() {
        reads++;
        delete array[1];
        array[2] = 2;
        return 1;
      },
    });
    defineProperty(array, '1', { get: () => assert.avoid('deleted index is not read') });

    const copy = structuredClone(array);
    assert.same(copy.length, 2, 'original length preserved');
    assert.arrayEqual(keys(copy), ['0'], 'deleted index stays a hole and added index is ignored');
    assert.same(copy[0], 1, 'getter result copied');
    assert.same(reads, 1, 'getter runs once');
  });

  // [Serializable] Platform objects

  // Geometry types
  // Deno 2.8-2.9 clones DOMMatrix as a plain object.
  if (!DENO && typeof DOMMatrix == 'function') {
    QUnit.test('Geometry types, DOMMatrix', assert => {
      cloneObjectTest(assert, new DOMMatrix(), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno 2.8-2.9 clones DOMMatrixReadOnly as a plain object.
  if (!DENO && typeof DOMMatrixReadOnly == 'function' && typeof DOMMatrixReadOnly.fromMatrix == 'function') {
    QUnit.test('Geometry types, DOMMatrixReadOnly', assert => {
      cloneObjectTest(assert, new DOMMatrixReadOnly(), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno 2.8-2.9 clones DOMPoint as a plain object.
  if (!DENO && typeof DOMPoint == 'function') {
    QUnit.test('Geometry types, DOMPoint', assert => {
      cloneObjectTest(assert, new DOMPoint(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno 2.8-2.9 clones DOMPointReadOnly as a plain object.
  if (!DENO && typeof DOMPointReadOnly == 'function' && typeof DOMPointReadOnly.fromPoint == 'function') {
    QUnit.test('Geometry types, DOMPointReadOnly', assert => {
      cloneObjectTest(assert, new DOMPointReadOnly(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno 2.8-2.9 clones DOMQuad as a plain object.
  if (!DENO && typeof DOMQuad == 'function' && typeof DOMPoint == 'function') {
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

  // Deno 2.8-2.9 clones DOMRect as a plain object.
  if (!DENO && fromSource('new DOMRect(1, 2, 3, 4)')) {
    QUnit.test('Geometry types, DOMRect', assert => {
      cloneObjectTest(assert, new DOMRect(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno 2.8-2.9 clones DOMRectReadOnly as a plain object.
  if (!DENO && typeof DOMRectReadOnly == 'function' && typeof DOMRectReadOnly.fromRect == 'function') {
    QUnit.test('Geometry types, DOMRectReadOnly', assert => {
      cloneObjectTest(assert, new DOMRectReadOnly(1, 2, 3, 4), (orig, clone) => {
        for (const key of keys(getPrototypeOf(orig))) {
          assert.same(orig[key], clone[key], `Property ${ key }`);
        }
      });
    });
  }

  // Deno through 2.7 clones ImageData as a plain object.
  // Safari 8- does not support `{ colorSpace }` option
  if ((!DENO || DENO_VERSION >= 208) && fromSource('new ImageData(new ImageData(8, 8).data, 8, 8, { colorSpace: new ImageData(8, 8).colorSpace })')) {
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

  // Deno 1.x (except 1.10) and 2.0-2.7 lose Blob data or its prototype when cloning.
  if ((!DENO || DENO_VERSION === 110 || DENO_VERSION >= 208) && fromSource('new Blob(["test"])')) QUnit.test('Blob', assert => {
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
  // Deno 1.0 loses the File prototype; 1.10 ignores inherited type / lastModified options.
  if (!BUN && (!DENO || DENO_VERSION >= 111) && fromSource('new File(["test"], "foo.txt")')) QUnit.test('File', assert => {
    cloneObjectTest(
      assert,
      new File(['This is a test.'], 'foo.txt', { type: 'c/d', lastModified: 123 }),
      (orig, clone) => {
        assert.same(orig.size, clone.size);
        assert.same(orig.type, clone.type);
        assert.same(orig.name, clone.name);
        // Old Firefox versions ignore the lastModified option.
        if (orig.lastModified === 123) assert.same(orig.lastModified, clone.lastModified);
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
        assert.same(clone.length, 1);
        assert.same(orig[0].size, clone[0].size);
        assert.same(orig[0].type, clone[0].type);
        assert.same(orig[0].name, clone[0].name);
        assert.same(orig[0].lastModified, clone[0].lastModified);
      },
    );
  });

  // Circular references
  QUnit.test('circular references', assert => {
    const obj = { a: 1 };
    obj.self = obj;
    const clone = structuredClone(obj);
    assert.notSame(obj, clone, 'clone should have different reference');
    assert.same(clone.a, 1, 'primitive property preserved');
    assert.same(clone.self, clone, 'circular reference preserved');
    assert.notSame(clone.self, obj, 'circular reference points to clone, not original');

    const arr = [1, 2];
    arr.push(arr);
    const arrClone = structuredClone(arr);
    assert.notSame(arr, arrClone, 'array clone different reference');
    assert.same(arrClone[0], 1, 'array element preserved');
    assert.same(arrClone[2], arrClone, 'array circular reference preserved');

    // Multiple references to same object should be deduplicated
    const shared = { x: 1 };
    const multi = { a: shared, b: shared };
    const multiClone = structuredClone(multi);
    assert.notSame(multi.a, multiClone.a, 'shared object cloned');
    assert.same(multiClone.a, multiClone.b, 'multiple references deduplicated');
  });

  QUnit.test('transfer list validation', assert => {
    assert.throws(() => structuredClone(1, { transfer: [{}] }), isTransferError, 'non-transferable object');
    if (typeof ArrayBuffer == 'function') {
      const buffer = new ArrayBuffer(8);
      assert.throws(() => structuredClone(buffer, { transfer: [buffer, buffer] }), error => error.name === 'DataCloneError', 'duplicate transferable');
      assert.same(buffer.byteLength, 8, 'duplicate transfer preserves the buffer');
    }
    const shared = fromSource('new SharedArrayBuffer(8)');
    if (shared) {
      assert.throws(() => structuredClone(1, { transfer: [shared] }), error => error.name === 'DataCloneError', 'SharedArrayBuffer is not transferable');
      assert.same(shared.byteLength, 8, 'invalid transfer preserves the shared buffer');
    }
  });

  // Transfer
  // `ArrayBuffer#transfer` is installed only where the polyfill has a way to detach a buffer, the same one `structuredClone` uses
  if (typeof Uint8Array == 'function' && ArrayBuffer.prototype.transfer) QUnit.test('transfer', assert => {
    const empty = new ArrayBuffer(0);
    assert.same(structuredClone(empty, { transfer: [empty] }).byteLength, 0, 'empty buffer transferred');
    assert.throws(() => structuredClone(empty), error => error.name === 'DataCloneError', 'detached empty buffer is not cloneable');
    assert.throws(() => structuredClone(1, { transfer: [empty] }), error => error.name === 'DataCloneError', 'empty buffer cannot be transferred twice');
    const buffer = new ArrayBuffer(4);
    new Uint8Array(buffer).set([1, 2, 3, 4]);
    const clone = structuredClone(buffer, { transfer: [buffer] });
    assert.arrayEqual(new Uint8Array(clone), [1, 2, 3, 4], 'transferred data preserved');
    assert.same(buffer.byteLength, 0, 'source buffer detached');
    assert.same(clone.byteLength, 4, 'clone buffer has correct length');
    assert.throws(() => structuredClone(buffer), error => error.name === 'DataCloneError', 'a detached buffer is not cloneable');
    assert.throws(() => structuredClone(1, { transfer: [buffer] }), error => error.name === 'DataCloneError', 'detached transfer list entry');
    const other = new ArrayBuffer(4);
    Object.defineProperty(other, 'transfer', { get() { throw new Error('transfer must not be read'); } });
    assert.same(structuredClone(1, { transfer: [other] }), 1, 'does not call an own transfer method');
    assert.same(other.byteLength, 0, 'unreferenced buffer detached');
    for (const C of [Uint8Array, fromSource('DataView')]) {
      if (!C) continue;
      const source = new ArrayBuffer(4);
      const view = new C(source);
      const input = { buffer: source };
      defineProperty(input, 'view', {
        enumerable: true,
        get() {
          structuredClone(null, { transfer: [source] });
          return view;
        },
      });
      assert.throws(() => structuredClone(input), error => error.name === 'DataCloneError', 'detached view after its buffer was cloned');
      assert.throws(() => structuredClone(view), error => error.name === 'DataCloneError', 'a detached view is not cloneable');
    }
  }); else if (typeof Uint8Array == 'function') QUnit.test('unsupported transfer', assert => {
    const buffer = new ArrayBuffer(4);
    let reads = 0;
    const value = defineProperty({}, 'buffer', { enumerable: true, get() {
      reads++;
      return buffer;
    } });
    assert.throws(() => structuredClone(value, { transfer: [buffer] }), error => error.name === 'DataCloneError', 'unavailable transfer');
    assert.same(reads, 0, 'unsupported transfer is rejected before serialization');
    assert.same(buffer.byteLength, 4, 'source is preserved');
  });

  // Deno 1.13 can transfer MessagePorts, but neither structuredClone nor MessageChannel can detach ArrayBuffers.
  if (/^1\.13\./.test(GLOBAL.Deno?.version?.deno)) QUnit.test('partial transfer support', assert => {
    assert.same(typeof ArrayBuffer.prototype.transfer, 'undefined', 'unavailable transfer is not installed');
    assert.same(typeof ArrayBuffer.prototype.transferToFixedLength, 'undefined', 'unavailable transferToFixedLength is not installed');
    assert.true(structuredClone.sham, 'incomplete transfer support is marked');
    for (const bufferFirst of [false, true]) {
      const { port1, port2 } = new MessageChannel();
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer)[0] = 42;
      let reads = 0;
      const value = defineProperty({}, 'buffer', { enumerable: true, get() {
        reads++;
        return buffer;
      } });
      let copy;
      // Close the ports even if cloning throws unexpectedly.
      try {
        assert.throws(() => structuredClone(value, { transfer: bufferFirst ? [buffer, port1] : [port1, buffer] }), isTransferError, 'unsupported buffer transfer');
        assert.same(reads, 0, 'unsupported transfer is rejected before serialization');
        assert.same(buffer.byteLength, 4, 'source buffer is preserved');
        assert.same(new Uint8Array(buffer)[0], 42, 'source data is preserved');
        copy = structuredClone({ port: port1, again: port1, buffer }, { transfer: [port1] });
        assert.notSame(copy.port, port1, 'port remains transferable');
        assert.same(copy.port, copy.again, 'port references are preserved');
        assert.notSame(copy.buffer, buffer, 'buffer can still be cloned without transfer');
        assert.same(new Uint8Array(copy.buffer)[0], 42, 'cloned data is preserved');
        assert.same(buffer.byteLength, 4, 'cloning does not detach the buffer');
        assert.throws(() => structuredClone(port1, { transfer: [port1] }), isTransferError, 'successful transfer detaches the original port');
      } finally {
        if (copy) copy.port.close();
        port1.close();
        port2.close();
      }
    }
  });

  if (typeof MessageChannel == 'function' && !structuredClone.sham) {
    QUnit.test('failed transfer preserves MessagePort', assert => {
      for (const scenario of ['uncloneable', 'getter', 'invalid', 'duplicate', 'duplicate buffer', 'view', 'shared', 'detached buffer']) {
        const shared = scenario === 'shared' && fromSource('new SharedArrayBuffer(1)');
        if (scenario === 'shared' && !shared) continue;
        const { port1, port2 } = new MessageChannel();
        const marker = new Error('getter failure');
        let reads = 0;
        const value = { port: port1 };
        const buffer = new ArrayBuffer(1);
        defineProperty(value, 'failure', { enumerable: true, get() {
          reads++;
          if (scenario === 'getter') throw marker;
          if (scenario === 'detached buffer') return structuredClone(1, { transfer: [buffer] });
          return scenario === 'shared' ? 1 : function () { /* uncloneable */ };
        } });
        const transfer = scenario === 'detached buffer' ? [buffer, port1] : [port1];
        switch (scenario) {
          case 'uncloneable':
          case 'getter':
            transfer.push(buffer);
            break;
          case 'invalid':
            transfer.push({});
            break;
          case 'duplicate':
            transfer.push(port1);
            break;
          case 'duplicate buffer':
            transfer.push(buffer, buffer);
            break;
          case 'view':
            transfer.push(new Uint8Array(1));
            break;
          case 'shared':
            transfer.push(shared);
            break;
        }
        let copy;
        try {
          assert.throws(() => structuredClone(value, { transfer }), error => scenario === 'getter'
            ? error === marker : isTransferError(error), scenario);
          assert.same(reads, scenario === 'uncloneable' || scenario === 'getter' || scenario === 'detached buffer' ? 1 : 0, `${ scenario }: validation precedes serialization`);
          if (scenario === 'uncloneable' || scenario === 'getter') assert.same(buffer.byteLength, 1, 'failed transfer preserves the buffer');
          copy = structuredClone(port1, { transfer: [port1] });
          assert.same(typeof copy.postMessage, 'function', 'port remains transferable');
        } finally {
          if (copy) copy.close();
          port1.close();
          port2.close();
        }
      }
    });

    QUnit.test('transferred references', assert => {
      // Bun 1.4.4: native structuredClone returns the original MessagePort without detaching it.
      const portTransferAssert = BUN ? assert.skip : assert;
      const { port1, port2 } = new MessageChannel();
      const buffer = new ArrayBuffer(4);
      const error = new AggregateError([port1], 'transfer', { cause: port1 });
      let reads = 0;
      const value = {
        port: port1,
        array: [port1],
        map: new Map([[port1, port1], ['port', port1]]),
        set: new Set([port1]),
        error,
        buffer,
        view: new Uint8Array(buffer),
      };
      defineProperty(value, 'repeated', { enumerable: true, get() {
        reads++;
        return port1;
      } });
      value.self = value;
      value.map.set(value.map, port1);
      value.set.add(value.set);
      defineProperty(value, '__proto__', { enumerable: true, value: port1 });
      const shared = fromSource('new SharedArrayBuffer(4, { maxByteLength: 8 })');
      if (shared?.growable) {
        value.shared = shared;
        value.sharedView = new Uint8Array(shared);
        value.map.set(value.sharedView, port1);
      }
      let copy;
      try {
        copy = structuredClone(value, { transfer: [port1, buffer] });
        portTransferAssert.notSame(copy.port, port1, 'port transferred');
        assert.same(copy.array[0], copy.port, 'array');
        assert.same(copy.map.get(copy.port), copy.port, 'map key and value');
        assert.same(copy.map.get('port'), copy.port, 'map value');
        assert.same(copy.map.get(copy.map), copy.port, 'map cycle');
        const mapKeys = [copy.port, 'port', copy.map];
        if (shared?.growable) mapKeys.push(copy.sharedView);
        assert.arrayEqual(from(copy.map.keys()), mapKeys, 'map order');
        assert.arrayEqual(from(copy.set), [copy.port, copy.set], 'set order and cycle');
        assert.same(copy.error.cause, copy.port, 'error cause');
        assert.same(copy.error.errors[0], copy.port, 'aggregate errors');
        assert.same(copy.repeated, copy.port, 'getter result');
        assert.same(reads, 1, 'getter read once');
        assert.same(copy.self, copy, 'object cycle');
        // eslint-disable-next-line no-proto -- own data property, not the legacy accessor
        assert.same(copy.__proto__, copy.port, 'own __proto__');
        assert.same(getPrototypeOf(copy), Object.prototype, 'prototype preserved');
        assert.same(copy.view.buffer, copy.buffer, 'buffer and view identity');
        assert.same(buffer.byteLength, 0, 'buffer detached');
        if (shared?.growable) {
          assert.same(copy.sharedView.buffer, copy.shared, 'shared view buffer identity');
          assert.same(copy.map.get(copy.sharedView), copy.port, 'shared view and port replacements');
          shared.grow(8);
          assert.same(copy.sharedView.length, 8, 'shared tracking view');
          new Uint8Array(shared)[0] = 42;
          assert.same(copy.sharedView[0], 42, 'shared memory preserved');
        }
        portTransferAssert.throws(() => structuredClone(port1, { transfer: [port1] }), 'original port detached');
      } finally {
        if (copy) copy.port.close();
        port1.close();
        port2.close();
      }
    });
  }

  for (const type of ['ReadableStream', 'WritableStream', 'TransformStream']) if (typeof GLOBAL[type] == 'function') {
    QUnit.test(`failed transfer preserves ${ type }`, assert => {
      const stream = new GLOBAL[type]();
      assert.throws(() => structuredClone({ stream, uncloneable() { /* empty */ } }, { transfer: [stream] }), error => error.name === 'DataCloneError');
      if (type === 'TransformStream') {
        assert.false(stream.readable.locked, 'readable side stays unlocked');
        assert.false(stream.writable.locked, 'writable side stays unlocked');
      } else assert.false(stream.locked, 'stream stays unlocked');
    });
  }
  // Older Deno releases expose process but do not support stream transfer.
  if (NODE && typeof Deno == 'undefined' && typeof ReadableStream == 'function' && !structuredClone.sham) QUnit.test('ReadableStream transfer follows serialization', assert => {
    const stream = new ReadableStream({ start(controller) { controller.close(); } });
    let reads = 0;
    const value = { stream };
    defineProperty(value, 'again', { enumerable: true, get() {
      reads++;
      assert.false(stream.locked, 'stream is unlocked during serialization');
      return stream;
    } });
    const copy = structuredClone(value, { transfer: [stream] });
    assert.same(reads, 1, 'getter runs once');
    assert.same(copy.stream, copy.again, 'stream reference');
    assert.true(stream.locked, 'source transferred');
    assert.false(copy.stream.locked, 'copy is unlocked');
    return copy.stream.getReader().read().then(result => {
      assert.deepEqual(result, { value: undefined, done: true }, 'closed stream preserved');
    });
  });

  const media = [];
  if (typeof AudioData == 'function') media.push(['AudioData', () => new AudioData({
    format: 'u8', sampleRate: 8000, numberOfFrames: 1, numberOfChannels: 1, timestamp: 0, data: new Uint8Array([128]),
  }), 'numberOfFrames']);
  if (typeof VideoFrame == 'function') media.push(['VideoFrame', () => new VideoFrame(new Uint8Array([0, 0, 0, 255]), {
    format: 'RGBA', codedWidth: 1, codedHeight: 1, timestamp: 0,
  }), 'codedWidth']);
  // Deno exposes ImageBitmap without native transfer support.
  if (!DENO && typeof createImageBitmap == 'function' && (!structuredClone.sham || fromSource("new OffscreenCanvas(1, 1).getContext('bitmaprenderer')"))) {
    media.push(['ImageBitmap', () => createImageBitmap(new ImageData(1, 1)), 'width']);
  }
  for (const [type, create, size] of media) QUnit.test(`${ type } transfer`, assert => {
    const tasks = [];
    const scenarios = ['uncloneable', 'getter', 'invalid', 'duplicate', 'graph', 'root', 'unused', 'detached-first'];
    if (!structuredClone.sham && typeof MessageChannel == 'function') scenarios.push('mixed-first', 'mixed-last');
    // Native engines can reject detached resources before the transfer phase; test partial order in the fallback.
    if (structuredClone.sham) scenarios.push('detached-last', 'closed-first', 'closed-last');
    for (const scenario of scenarios) tasks.push(Promise.try(create).then(source => {
      let copy;
      try {
        switch (scenario) {
          case 'uncloneable':
          case 'getter':
          case 'invalid':
          case 'duplicate': {
            const marker = new Error('getter failure');
            let reads = 0;
            let clones = 0;
            const { clone } = source;
            if (clone) source.clone = function () {
              clones++;
              return clone.call(this);
            };
            const value = { source };
            defineProperty(value, 'failure', { enumerable: true, get() {
              reads++;
              if (scenario === 'getter') throw marker;
              return function () { /* uncloneable */ };
            } });
            const transfer = scenario === 'invalid' ? [source, {}] : scenario === 'duplicate' ? [source, source] : [source];
            assert.throws(() => structuredClone(value, { transfer }), error => scenario === 'getter' ? error === marker : error.name === 'DataCloneError', scenario);
            assert.same(reads, scenario === 'uncloneable' || scenario === 'getter' ? 1 : 0, `${ scenario }: validation precedes serialization`);
            assert.same(source[size], 1, 'failed clone preserves the source');
            assert.same(clones, 0, 'failed clone does not allocate a media copy');

            break;
          }
          case 'root':
          case 'unused':
            copy = structuredClone(scenario === 'root' ? source : 1, { transfer: [source] });
            assert.same(scenario === 'root' ? copy[size] : copy, 1, 'root result');
            assert.same(source[size], 0, 'source transferred');

            break;
          case 'mixed-first':
          case 'mixed-last': {
            const buffer = new ArrayBuffer(4);
            new Uint8Array(buffer)[0] = 42;
            const { port1, port2 } = new MessageChannel();
            let port;
            try {
              const transfer = scenario === 'mixed-first' ? [source, buffer, port1] : [buffer, port1, source];
              const result = structuredClone({ source, buffer, port: port1 }, { transfer });
              copy = result.source;
              port = result.port;
              assert.notSame(copy, source, 'mixed transfer creates a media copy');
              assert.same(copy[size], 1, 'mixed transfer preserves media data');
              assert.same(source[size], 0, 'mixed transfer closes the source');
              assert.same(buffer.byteLength, 0, 'mixed transfer detaches the buffer');
              assert.same(new Uint8Array(result.buffer)[0], 42, 'mixed transfer preserves buffer data');
              assert.notSame(port, port1, 'mixed transfer creates a new port');
              assert.same(typeof port.postMessage, 'function', 'mixed transfer preserves the port type');
            } finally {
              if (port) port.close();
              port1.close();
              port2.close();
            }

            break;
          }
          case 'graph': {
            let reads = 0;
            const value = { source, map: new Map([[source, source]]), set: new Set([source]) };
            defineProperty(value, 'again', { enumerable: true, get() {
              reads++;
              assert.same(source[size], 1, 'source is open during serialization');
              return source;
            } });
            const graph = structuredClone(value, { transfer: [source] });
            copy = graph.source;
            assert.same(reads, 1, 'getter runs once');
            assert.notSame(copy, source, 'new media object');
            assert.same(copy[size], 1, 'media data preserved');
            assert.same(graph.again, copy, 'repeated reference');
            assert.same(graph.map.get(copy), copy, 'map key and value');
            assert.true(graph.set.has(copy), 'set entry');
            assert.same(source[size], 0, 'source transferred');

            break;
          }
          default: {
            const buffer = new ArrayBuffer(4);
            const detached = scenario === 'detached-first' || scenario === 'detached-last';
            const bufferFirst = scenario === 'detached-first' || scenario === 'closed-last';
            if (detached) structuredClone(1, { transfer: [buffer] });
            else source.close();
            const transfer = bufferFirst ? [buffer, source] : [source, buffer];
            assert.throws(() => structuredClone(1, { transfer }), error => error.name === 'DataCloneError', scenario);
            if (detached) assert.same(source[size], bufferFirst ? 1 : 0, 'transfer-list order preserves later media');
            else assert.same(buffer.byteLength, bufferFirst ? 0 : 4, 'transfer-list order preserves later buffers');
          }
        }
      } finally {
        if (copy && copy.close) copy.close();
        source.close();
      }
    }));
    return Promise.all(tasks);
  });

  // Non-serializable types
  QUnit.test('Non-serializable types', assert => {
    const nons = [
      ['Function', function () { return 1; }],
      ['Symbol', Symbol('desc')],
      ['global object', GLOBAL],
      ['WeakMap', new WeakMap()],
      ['WeakSet', new WeakSet()],
    ];

    const event = fromSource('new Event("")');

    // NodeJS and Deno 1.x events are cloned as ordinary objects.
    if (event && !NODE && (!DENO || DENO_VERSION >= 200)) nons.push(['Event', event]);

    for (const [name, it] of nons) {
      assert.throws(() => structuredClone(it), error => error.name === 'DataCloneError', name);
    }

    const channel = fromSource('new MessageChannel()');
    if (channel) {
      try {
        // Old NodeJS throws a TypeError for a MessagePort omitted from the transfer list.
        // https://github.com/nodejs/node/issues/40841
        assert.throws(() => structuredClone(channel.port1), error => error.name === 'DataCloneError' || NODE && error instanceof TypeError, 'MessagePort');
      } finally {
        channel.port1.close();
        channel.port2.close();
      }
    }
  });
});
