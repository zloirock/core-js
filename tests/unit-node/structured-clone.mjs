/* eslint-disable es/no-resizable-and-growable-arraybuffers -- supported by development Node.js versions */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const [flavor, mode] = process.argv.slice(2);

if (!flavor) {
  for (const variant of ['core-js', 'core-js-pure']) {
    for (const scenario of ['missing', 'broken', 'identity', 'shared', 'shared-copy']) {
      const { stdout } = await promisify(execFile)(process.execPath, [fileURLToPath(import.meta.url), variant, scenario]);
      console.log(stdout.trim());
    }
  }
} else {
  const require = createRequire(import.meta.url);
  const prototype = Object.getPrototypeOf(Uint8Array.prototype);
  const nativeClone = globalThis.structuredClone;
  const lengths = new Map();
  if (mode === 'identity') {
    globalThis.structuredClone = function (value) { return value; };
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
  } else if (mode !== 'shared') {
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
    assert.throws(() => clone(input), { name: 'DataCloneError' });
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
  console.log(`${ flavor }: structuredClone with ${ mode } built-in: passed`);
}
