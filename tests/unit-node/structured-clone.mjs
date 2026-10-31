/* eslint-disable es/no-resizable-and-growable-arraybuffers -- supported by development Node.js versions */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const [flavor, mode] = process.argv.slice(2);

if (!flavor) {
  for (const variant of ['core-js', 'core-js-pure']) {
    for (const scenario of ['missing', 'broken', 'identity', 'shared', 'shared-copy', 'buffer-errors', 'collections']) {
      const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(import.meta.url), variant, scenario]);
      console.log(stdout.trim());
    }
  }
} else {
  const require = createRequire(import.meta.url);
  const prototype = Object.getPrototypeOf(Uint8Array.prototype);
  const nativeClone = globalThis.structuredClone;
  const lengths = new Map();
  if (mode === 'buffer-errors' || mode === 'collections') {
    const configure = flavor === 'core-js'
      ? require('../../packages/core-js/configurator')
      : require('../../packages/core-js-pure/configurator');
    configure({ usePolyfill: ['structuredClone'] });
  }
  if (mode === 'identity') {
    globalThis.structuredClone = function (value) { return value; };
    if (flavor === 'core-js') {
      // loaded before the `structuredClone` polyfill replaces the identity global, the transfer methods keep trusting it
      require('../../packages/core-js/configurator')({
        usePolyfill: ['ArrayBuffer.prototype.transfer', 'ArrayBuffer.prototype.transferToFixedLength'],
      });
      require('../../packages/core-js/modules/es.array-buffer.transfer');
      require('../../packages/core-js/modules/es.array-buffer.transfer-to-fixed-length');
    }
  } else if (mode === 'shared-copy') {
    // Model WebKit preserving view modes while copying shared memory into an ArrayBuffer.
    globalThis.structuredClone = function cloneShared(value, options) {
      if (value instanceof SharedArrayBuffer) {
        const copy = new ArrayBuffer(value.byteLength, value.growable ? { maxByteLength: value.maxByteLength } : undefined);
        new Uint8Array(copy).set(new Uint8Array(value));
        return copy;
      }
      if (ArrayBuffer.isView(value) && value.buffer instanceof SharedArrayBuffer) {
        return new Uint8Array(cloneShared(value.buffer), value.byteOffset, lengths.get(value));
      }
      return nativeClone(value, options);
    };
  } else if (mode !== 'shared' && mode !== 'buffer-errors' && mode !== 'collections') {
    if (mode === 'missing') delete prototype.set;
    else prototype.set = function () { throw new Error('Broken native set'); };
    const previous = prototype.set;
    // Repair set before structuredClone captures any built-ins.
    require('../../packages/core-js/modules/es.typed-array.set');
    assert.equal(typeof prototype.set, 'function');
    assert.notEqual(prototype.set, previous);
  }
  const clone = flavor === 'core-js'
    ? require('../../packages/core-js/actual/structured-clone')
    : require('../../packages/core-js-pure/actual/structured-clone');

  const shared = mode === 'shared' || mode === 'shared-copy';
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
    const marker = new Error('View getter failed');
    for (const C of [DataView, Uint8Array]) {
      for (const key of ['byteOffset', C === DataView ? 'byteLength' : 'length']) {
        const view = new C(new ArrayBuffer(4, { maxByteLength: 8 }));
        Object.defineProperty(view, key, { get() { throw marker; } });
        assert.throws(() => clone(view), error => error === marker, `${ C.name }.${ key }`);
      }
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
      if (mode === 'shared-copy') assert.equal(copy.buffer, buffer);
      else assert.notEqual(copy.buffer, buffer);
      tracking[0] = 73;
      assert.equal(copy.tracking[0], 73);
      copy.buffer.grow(16);
    } else copy.buffer.resize(16);
    assert.equal(copy.fixed.length, 8);
    assert.equal(copy.tracking.length, 16);
  }
  assert.equal(buffer.byteLength, shared ? 16 : 8);

  if (mode === 'collections') {
    assert.notEqual(clone, nativeClone);
    const PureMap = require('../../packages/core-js-pure/es/map');
    const PureSet = require('../../packages/core-js-pure/es/set');
    for (const [M, S] of [[Map, Set], [PureMap, PureSet]]) {
      const value = { data: 1 };
      const map = new M([[value, 1], [2, value]]);
      const set = new S([value, map]);
      map.set(map, set);
      set.add(set);
      const copy = clone({ map, set });
      const [key] = copy.map.keys();
      assert.notEqual(key, value);
      assert.deepEqual(key, value);
      assert.equal(copy.map.get(2), key);
      assert.equal(copy.map.get(copy.map), copy.set);
      assert.ok(copy.set.has(key));
      assert.ok(copy.set.has(copy.map));
      assert.ok(copy.set.has(copy.set));
    }
  }

  if (mode === 'buffer-errors') {
    assert.notEqual(clone, nativeClone);
    const marker = new RangeError('Buffer copy failed');
    for (const [object, key, target] of [
      [ArrayBuffer.prototype, 'slice'],
      [globalThis, 'ArrayBuffer'],
      [globalThis, 'DataView'],
      [globalThis, 'DataView', true],
      [DataView.prototype, 'getUint8'],
      [DataView.prototype, 'setUint8'],
    ]) {
      for (const resizable of [false, true]) {
        if (key === 'slice' && resizable) continue;
        const source = new ArrayBuffer(4, resizable ? { maxByteLength: 8 } : undefined);
        new Uint8Array(source).set([0, 1, 254, 255]);
        // Exercise the fallback for fixed buffers in engines without ArrayBuffer#slice.
        if (key !== 'slice' && !resizable) source.slice = undefined;
        const previous = object[key];
        let calls = 0;
        object[key] = function (data) {
          if (target && !calls++) return Reflect.construct(previous, [data]);
          throw marker;
        };
        try {
          assert.throws(() => clone(source), error => error === marker, `${ key }, resizable: ${ resizable }, target: ${ !!target }`);
        } finally {
          object[key] = previous;
        }
        assert.deepEqual([...new Uint8Array(source)], [0, 1, 254, 255]);
      }
    }
    for (const C of [ArrayBuffer, DataView, Uint8Array]) {
      const properties = C === ArrayBuffer ? ['slice', 'resizable', 'byteLength', 'maxByteLength']
        : ['byteOffset', C === DataView ? 'byteLength' : 'length'];
      for (const key of properties) {
        const source = new ArrayBuffer(4);
        const view = C === ArrayBuffer ? source : new C(source);
        if (key === 'byteLength' || key === 'maxByteLength') source.slice = undefined;
        Object.defineProperty(view, key, { get() { throw marker; } });
        assert.throws(() => clone(view), error => error === marker, `${ C.name }.${ key }`);
        assert.equal(new Uint8Array(source).length, 4);
      }
    }
    for (const resizable of [false, true]) {
      for (const length of [0, 4]) {
        const source = new ArrayBuffer(length, resizable ? { maxByteLength: 8 } : undefined);
        const copy = clone(source);
        assert.notEqual(copy, source);
        assert.equal(copy.byteLength, length);
        assert.equal(copy.resizable, resizable);
        const views = [new DataView(source), new Uint8Array(source)];
        nativeClone(source, { transfer: [source] });
        assert.throws(() => clone(source), { name: 'DataCloneError' });
        for (const view of views) assert.throws(() => clone(view), { name: 'DataCloneError' });
      }
    }
  }
  console.log(`${ flavor }: structuredClone with ${ mode } built-in: passed`);
}
