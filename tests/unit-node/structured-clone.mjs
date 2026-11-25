/* eslint-disable es/no-resizable-and-growable-arraybuffers -- supported by development Node.js versions */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const [flavor, mode] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const loadClone = () => flavor === 'core-js'
  ? require('../../packages/core-js/actual/structured-clone')
  : require('../../packages/core-js-pure/actual/structured-clone');

if (!flavor) {
  // isolate changes to built-ins and the order in which the polyfills load
  for (const variant of ['core-js', 'core-js-pure']) {
    for (const scenario of ['missing', 'broken', 'late-constructors', 'identity', 'shared-copy', 'shared-fixed-copy', 'buffer-errors']) {
      const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(import.meta.url), variant, scenario]);
      console.log(stdout.trim());
    }
  }
} else if (mode === 'late-constructors') {
  for (const name of ['structuredClone', 'PerformanceMark', 'ArrayBuffer', 'DataView', 'Uint8Array']) delete globalThis[name];
  const clone = loadClone();
  // the global `DataView` polyfill also installs the tag used by `structuredClone` in IE10-11
  const View = require('../../packages/core-js/actual/data-view');
  assert.equal(clone(new ArrayBuffer(0)).byteLength, 0, 'late slice before Uint8Array');
  const buffer = new ArrayBuffer(5);
  Object.defineProperty(buffer, 'constructor', { value: undefined });
  const empty = clone(new View(buffer, 1, 0));
  assert.equal(empty.byteOffset, 1);
  assert.equal(empty.byteLength, 0);
  const view = new View(buffer, 1, 3);
  view.setUint8(2, 123);
  assert.equal(clone(view).getUint8(2), 123);
  const Bytes = require('../../packages/core-js/actual/typed-array/uint8-array');
  const copy = clone({ buffer, view, bytes: new Bytes(buffer, 2) });
  assert.notEqual(copy.buffer, buffer);
  assert.equal(copy.view.buffer, copy.buffer);
  assert.equal(copy.bytes.buffer, copy.buffer);
  assert.equal(copy.bytes[1], 123);
  console.log(`${ flavor }: structuredClone before buffer entry points: passed`);
} else {
  const prototype = Object.getPrototypeOf(Uint8Array.prototype);
  const nativeClone = globalThis.structuredClone;
  const constructors = { ArrayBuffer, DataView, Uint8Array };
  const viewPrototype = DataView.prototype;
  const byteLength = Object.getOwnPropertyDescriptor(viewPrototype, 'byteLength');
  const repairSet = mode === 'missing' || mode === 'broken';
  const lengths = new Map();
  if (repairSet || mode === 'buffer-errors') {
    const configure = flavor === 'core-js'
      ? require('../../packages/core-js/configurator')
      : require('../../packages/core-js-pure/configurator');
    configure({ usePolyfill: ['structuredClone'] });
  }
  if (mode === 'identity') {
    globalThis.structuredClone = function (value) { return value; };
    delete viewPrototype.byteLength;
    if (flavor === 'core-js') {
      // loaded before the `structuredClone` polyfill replaces the identity global, the transfer methods keep trusting it
      require('../../packages/core-js/configurator')({
        usePolyfill: ['ArrayBuffer.prototype.transfer', 'ArrayBuffer.prototype.transferToFixedLength'],
      });
      require('../../packages/core-js/actual/array-buffer/transfer');
      require('../../packages/core-js/actual/array-buffer/transfer-to-fixed-length');
    }
  } else if (mode === 'shared-copy' || mode === 'shared-fixed-copy') {
    // older WebKit copies shared memory into an `ArrayBuffer`
    // a fixed copy also hides whether the view tracks the buffer length
    // https://bugs.webkit.org/show_bug.cgi?id=312016
    const fixedCopy = mode === 'shared-fixed-copy';
    globalThis.structuredClone = function cloneShared(value, options) {
      if (value instanceof SharedArrayBuffer) {
        const copy = new ArrayBuffer(value.byteLength, value.growable && !fixedCopy ? { maxByteLength: value.maxByteLength } : undefined);
        new Uint8Array(copy).set(new Uint8Array(value));
        return copy;
      }
      if (ArrayBuffer.isView(value) && value.buffer instanceof SharedArrayBuffer) {
        return new Uint8Array(cloneShared(value.buffer), value.byteOffset, fixedCopy ? value.length : lengths.get(value));
      }
      return nativeClone(value, options);
    };
  }
  if (repairSet) {
    if (mode === 'missing') {
      delete prototype.set;
      for (const name of Object.keys(constructors)) delete globalThis[name];
      delete globalThis.structuredClone;
    } else prototype.set = function () { throw new Error('Broken native set'); };
  }
  const previousSet = prototype.set;
  const clone = loadClone();
  if (mode === 'identity') Object.defineProperty(viewPrototype, 'byteLength', byteLength);
  if (repairSet) {
    if (mode === 'missing') {
      Object.assign(globalThis, constructors);
      const empty = new ArrayBuffer(0);
      assert.equal(clone(empty).byteLength, 0);
      nativeClone(empty, { transfer: [empty] });
      assert.throws(() => clone(empty), { name: 'DataCloneError' });
    }
    require('../../packages/core-js/actual/typed-array/set');
    assert.equal(typeof prototype.set, 'function');
    assert.notEqual(prototype.set, previousSet);
    const source = new ArrayBuffer(2, { maxByteLength: 4 });
    new Uint8Array(source)[1] = 123;
    const moved = clone(source, { transfer: [source] });
    assert.equal(source.byteLength, 0);
    assert.equal(moved.maxByteLength, 4);
    assert.equal(new Uint8Array(moved)[1], 123);
  }

  const shared = mode === 'shared-copy' || mode === 'shared-fixed-copy';
  const buffer = shared ? new SharedArrayBuffer(8, { maxByteLength: 16 }) : new ArrayBuffer(8, { maxByteLength: 16 });
  const fixed = new Uint8Array(buffer, 0, 8);
  const tracking = new Uint8Array(buffer);
  lengths.set(fixed, 8);
  const input = { buffer, fixed, tracking };
  if (mode === 'identity') {
    const plain = { a: [1] };
    const copy = clone(plain);
    assert.notEqual(copy, plain);
    assert.notEqual(copy.a, plain.a);
    assert.deepEqual(copy, plain);
    // without native cloning, views share one cloned buffer and keep their offsets and data, but lose length tracking
    tracking.set([1, 2, 3, 4, 5, 6, 7, 8]);
    const views = clone(input);
    assert.notEqual(views.buffer, buffer);
    assert.equal(views.fixed.buffer, views.buffer);
    assert.equal(views.tracking.buffer, views.buffer);
    assert.equal(views.buffer.maxByteLength, 16);
    assert.deepEqual([...views.tracking], [1, 2, 3, 4, 5, 6, 7, 8]);
    views.buffer.resize(16);
    assert.equal(views.fixed.length, 8);
    const sharedBuffer = new SharedArrayBuffer(8, { maxByteLength: 16 });
    const sharedView = clone(new Uint8Array(sharedBuffer, 2));
    assert.equal(sharedView.byteOffset, 2);
    assert.equal(sharedView.length, 6);
    new Uint8Array(sharedBuffer)[2] = 73;
    assert.equal(sharedView[0], 73);
    for (const C of [Uint8Array, Uint16Array, DataView]) {
      const bytes = C.BYTES_PER_ELEMENT || 1;
      const source = new ArrayBuffer(16, { maxByteLength: 32 });
      const outOfBounds = [new C(source, 0, 16 / bytes), new C(source, 8, 8 / bytes), new C(source, 8), new C(source, 16, 0)];
      const inBounds = [new C(source, 0, 0), new C(source, 4), new C(source, 4, 0)];
      source.resize(4);
      for (const view of outOfBounds) assert.throws(() => clone(view), { name: 'DataCloneError' }, C.name);
      for (const view of inBounds) {
        const viewCopy = clone(view);
        assert.equal(viewCopy.byteOffset, view.byteOffset);
        assert.equal(viewCopy.byteLength, 0);
      }
    }
    for (const C of [DataView, Uint8Array]) {
      const view = new C(new ArrayBuffer(4, { maxByteLength: 8 }), 1, 2);
      for (const key of ['buffer', 'byteOffset', 'byteLength', 'length']) {
        Object.defineProperty(view, key, { get() { throw new Error(key); } });
      }
      const viewCopy = clone(view);
      assert.equal(viewCopy.byteOffset, 1);
      assert.equal(viewCopy.byteLength, 2);
    }
    // the identity `structuredClone` is trusted to detach transferred buffers, but leaves them attached
    const transferable = new ArrayBuffer(4);
    new Uint8Array(transferable).set([1, 2, 3, 4]);
    const transferred = clone(transferable, { transfer: [transferable] });
    assert.equal(transferable.byteLength, 0);
    assert.deepEqual([...new Uint8Array(transferred)], [1, 2, 3, 4]);
    // the identity `structuredClone` fails basic cloning, so transfer lists are checked here and platform objects are not transferred
    assert.equal(clone.sham, true);
    const kept = new ArrayBuffer(4);
    assert.throws(() => clone(kept, { transfer: [kept, {}] }), { name: 'DataCloneError' });
    assert.equal(kept.byteLength, 4);
    const { port1, port2 } = new MessageChannel();
    try {
      assert.throws(() => clone(port1, { transfer: [port1] }), { name: 'DataCloneError' });
    } finally {
      port1.close();
      port2.close();
    }
    if (flavor === 'core-js') for (const method of ['transfer', 'transferToFixedLength']) {
      for (const length of [undefined, 2]) {
        const source = new ArrayBuffer(4);
        new Uint8Array(source).set([1, 2, 3, 4]);
        const moved = source[method](length);
        assert.equal(source.byteLength, 0, `${ method }(${ length })`);
        assert.deepEqual([...new Uint8Array(moved)], [1, 2, 3, 4].slice(0, length), `${ method }(${ length })`);
      }
    }
  } else {
    const copy = clone(input);
    assert.equal(copy.fixed.buffer, copy.buffer);
    assert.equal(copy.tracking.buffer, copy.buffer);
    if (shared) {
      assert.equal(copy.buffer, buffer);
      tracking[0] = 73;
      assert.equal(copy.tracking[0], 73);
      copy.buffer.grow(16);
    } else copy.buffer.resize(16);
    assert.equal(copy.fixed.length, 8);
    // without the mode, as without native cloning, length-tracking views are cloned as fixed-length views
    assert.equal(copy.tracking.length, mode === 'shared-fixed-copy' ? 8 : 16);
  }
  assert.equal(buffer.byteLength, shared ? 16 : 8);

  if (mode === 'buffer-errors') {
    assert.notEqual(clone, nativeClone);
    const marker = new RangeError('Buffer copy failed');
    const bufferPrototype = ArrayBuffer.prototype;
    const max = Object.getOwnPropertyDescriptor(bufferPrototype, 'maxByteLength');
    const empty = new ArrayBuffer(0, { maxByteLength: 8 });
    const growing = new ArrayBuffer(4, { maxByteLength: 8 });
    Object.defineProperty(bufferPrototype, 'maxByteLength', { configurable: true, get() {
      if (this === empty) nativeClone(empty, { transfer: [empty] });
      if (this === growing) growing.resize(8);
      return 8;
    } });
    try {
      assert.throws(() => clone(empty), TypeError, 'empty buffer detached before the copy');
      assert.equal(clone(growing).byteLength, 4, 'copies the length read before maxByteLength');
    } finally {
      Object.defineProperty(bufferPrototype, 'maxByteLength', max);
    }
    for (const resizable of [false, true]) {
      const view = resizable ? 'Uint8Array' : 'DataView';
      const operations = [[globalThis, 'ArrayBuffer'], [globalThis, view], [globalThis, view, true]];
      if (resizable) operations.push([prototype, 'set']);
      else operations.push([ArrayBuffer.prototype, 'slice'], [DataView.prototype, 'getUint8'], [DataView.prototype, 'setUint8']);
      for (const [object, key, target] of operations) {
        const source = new ArrayBuffer(4, resizable ? { maxByteLength: 8 } : undefined);
        new Uint8Array(source).set([0, 1, 254, 255]);
        const { slice } = bufferPrototype;
        // exercise the `DataView` fallback for IE10, which lacks native `ArrayBuffer#slice`
        if (key !== 'slice' && !resizable) bufferPrototype.slice = undefined;
        const previous = object[key];
        let calls = 0;
        object[key] = function (...args) {
          if (target && !calls++) return Reflect.construct(previous, args);
          throw marker;
        };
        if (object === globalThis) object[key].prototype = previous.prototype;
        try {
          assert.throws(() => clone(source), error => error === marker, `${ key }, resizable: ${ resizable }, target: ${ !!target }`);
        } finally {
          object[key] = previous;
          bufferPrototype.slice = slice;
        }
        assert.deepEqual([...new Uint8Array(source)], [0, 1, 254, 255]);
      }
    }
    for (const C of [ArrayBuffer, DataView, Uint8Array]) {
      const properties = C === ArrayBuffer ? ['resizable', 'byteLength', 'maxByteLength']
        : ['buffer', 'byteOffset', C === DataView ? 'byteLength' : 'length'];
      for (const key of properties) {
        const source = C === ArrayBuffer ? new ArrayBuffer(4, { maxByteLength: 8 }) : new ArrayBuffer(4);
        const view = C === ArrayBuffer ? source : new C(source);
        const owner = C === Uint8Array ? prototype : C.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(owner, key);
        Object.defineProperty(owner, key, { configurable: true, get() { throw marker; } });
        try {
          assert.throws(() => clone(view), error => error === marker, `${ C.name }.${ key }`);
        } finally {
          Object.defineProperty(owner, key, descriptor);
        }
        assert.equal(new Uint8Array(source).length, 4);
      }
    }
  }
  console.log(`${ flavor }: structuredClone with ${ mode } built-in: passed`);
}
