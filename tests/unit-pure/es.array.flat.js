import { DESCRIPTORS, GLOBAL, STRICT } from '../helpers/constants.js';
import flattenIntoArray from 'core-js-pure/internals/flatten-into-array';

import Symbol from 'core-js-pure/es/symbol';
import flat from 'core-js-pure/es/array/flat';
import defineProperty from 'core-js-pure/es/object/define-property';

QUnit.test('Array#flat', assert => {
  assert.isFunction(flat);
  assert.deepEqual(flat([]), []);
  let array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(flat(array, 0), array);
  assert.deepEqual(flat(array, 1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flat(array), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flat(array, 2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flat(array, 3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flat(array, -1), array);
  assert.deepEqual(flat(array, Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(() => flat(null), TypeError);
    assert.throws(() => flat(undefined), TypeError);
  }
  if (DESCRIPTORS) {
    assert.returns(() => flat(defineProperty({ length: -1 }, 0, {
      get() {
        throw new Error();
      },
    })).length, 0, 'uses ToLength');
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(flat(array).foo, 1, '@@species');
});

QUnit.test('Array#flat, deeply nested arrays in the polyfill', assert => {
  // Native methods have their own stack limits.
  const depth = 12000;
  const leaf = [42];
  let nested = leaf;
  for (let i = 0; i < depth; i++) nested = [nested];
  const input = [nested, nested];
  const result = [];
  flattenIntoArray(result, input, input.length, 0, Infinity);
  assert.deepEqual(result, [42, 42], 'visits both occurrences of a shared array');
  const partial = [];
  flattenIntoArray(partial, input, input.length, 0, depth);
  assert.same(partial[0], leaf, 'stops at the requested depth');
  assert.same(partial[1], leaf, 'restores the depth for the next element');
  const { Proxy } = GLOBAL;
  if (typeof Proxy == 'function') {
    const handler = { defineProperty() { throw new Error('unexpected write to source'); } };
    const readonly = new Proxy([new Proxy([42], handler)], handler);
    const copy = [];
    flattenIntoArray(copy, readonly, readonly.length, 0, Infinity);
    assert.deepEqual(copy, [42], 'does not define properties on source arrays');
  }
  if (DESCRIPTORS) {
    const cycle = [];
    let reads = 0;
    defineProperty(cycle, 0, { get() { return ++reads < 3 ? cycle : nested; } });
    const tail = [];
    flattenIntoArray(tail, cycle, 1, 0, Infinity);
    assert.deepEqual(tail, [42], 'handles deep nesting after a getter leaves a cycle');
  }
});

QUnit.test('Array#flat, cyclic arrays', assert => {
  const cycle = [];
  const other = [cycle];
  cycle[0] = other;
  assert.same(flat(cycle, 8)[0], other, 'finite depth on a cycle');
  if (DESCRIPTORS) {
    let reads = 0;
    let stopAt = 32;
    const outer = [cycle, 2];
    const stop = new Error('stop');
    let fail = false;
    defineProperty(other, 0, { get() {
      if (++reads !== stopAt) return [cycle];
      if (fail) throw stop;
      outer[1] = 3;
      outer[2] = 4;
      return 42;
    } });
    assert.deepEqual(flat(outer, Infinity), [42, 3], 'resumes at the next index within the original length');
    assert.same(reads, stopAt, 'reads the element again on reentry');
    reads = 0;
    // Let a broken implementation finish so it cannot hang the test runner.
    stopAt = 100000;
    assert.throws(() => flat(cycle, Infinity), 'an unbounded cycle exhausts the stack');
    reads = 0;
    const result = [];
    flattenIntoArray(result, cycle, cycle.length, 0, 3 * stopAt);
    assert.deepEqual(result, [42], 'finite depth permits the getter to finish');
    reads = 0;
    stopAt = 3;
    fail = true;
    assert.throws(() => flat(cycle, Infinity), error => error === stop, 'propagates a getter exception');
  }
});
