/* eslint-disable no-sequences, unicorn/no-unreadable-iife -- folded effectful key shapes */

import { receiver, resetReceiver } from './mutation-cases/live-import-receiver.js';

QUnit.test('computed key captures a reassigned receiver before its effect', assert => {
  let arr = [1, [2]];
  const result = arr[(() => (arr = { flat: () => 'swapped' }, 'flat'))()]();
  assert.deepEqual(result, [1, 2]);
  assert.same(arr.flat(), 'swapped');
});

QUnit.test('computed key keeps its effect on an immutable receiver', assert => {
  const arr = [1, [2]];
  let calls = 0;
  assert.deepEqual(arr[(() => (calls++, 'flat'))()](), [1, 2]);
  assert.same(calls, 1);
});

QUnit.test('method getter cannot replace the call receiver through its binding', assert => {
  let arr = ['held'];
  Object.defineProperty(arr, 'at', {
    get() {
      arr = ['swapped'];
      return function (index) { return this[index]; };
    },
  });
  assert.same(arr.at(0), 'held');
  assert.same(arr[0], 'swapped');
});

// Babel optional-call/import lowering re-reads the live receiver before post-only detection.
QUnit[typeof E2E_DETECT_LOWERED === 'undefined' ? 'test' : 'skip']('method getter cannot replace a live imported call receiver', assert => {
  for (const read of [
    () => receiver.at(0),
    // eslint-disable-next-line dot-notation -- retain the computed literal dispatch host
    () => receiver['at'](0),
    () => receiver?.at(0),
    () => receiver.at?.(0),
    () => receiver?.at?.(0),
  ]) {
    resetReceiver();
    assert.same(read(), 'held');
    assert.same(receiver[0], 'swapped');
  }
});

QUnit.test('computed key reads the receiver before the key and method getter', assert => {
  const log = [];
  const box = {
    get list() {
      log.push('receiver');
      return {
        label: 'held',
        get at() {
          log.push('method');
          return function (index) {
            log.push(this.label);
            return index;
          };
        },
      };
    },
  };
  assert.same(box.list[(() => (log.push('key'), 'at'))()](4), 4);
  assert.deepEqual(log, ['receiver', 'key', 'method', 'held']);
});

QUnit.test('computed key constructs a literal receiver before changing its element', assert => {
  let value = 'before';
  assert.same([value][(() => (value = 'after', 'at'))()](0), 'before');
  assert.same(value, 'after');
});

QUnit.test('computed optional key and call keep the captured receiver', assert => {
  let arr = ['held'];
  assert.same(arr?.[(() => (arr = { at: () => 'swapped' }, 'at'))()]?.(0), 'held');
  let skipped = 0;
  const empty = null;
  assert.same(empty?.[(() => (skipped++, 'at'))()]?.(0), undefined);
  assert.same(skipped, 0);
});

QUnit.test('sealed computed optional callee keeps its captured receiver', assert => {
  let arr = ['held'];
  // eslint-disable-next-line no-unsafe-optional-chaining -- the non-null sealed callee retains its receiver
  assert.same((arr?.[(() => (arr = { at: () => 'swapped' }, 'at'))()])(0), 'held');
});

QUnit.test('computed member read selects the method before a receiver reassignment', assert => {
  let arr = ['held'];
  const method = arr[(() => (arr = { at: () => 'swapped' }, 'at'))()];
  assert.same(method.call('abc', 0), 'a');
});

QUnit.test('computed optional member read serves the captured receiver', assert => {
  function read(input, replacement) {
    let arr = input;
    const method = arr?.[(() => (arr = replacement, 'at'))()];
    return method?.call(input, 0);
  }
  assert.same(read(['held'], { at: () => 'swapped' }), 'held');
  assert.same(read(null, { at: () => 'swapped' }), undefined);
});

QUnit.test('computed optional call evaluates a receiver prefix before its capture', assert => {
  let arr;
  const log = [];
  const result = (log.push('prefix'), arr = ['held'], arr)[(() => (log.push('key'), arr = ['after'], 'at'))()]?.(0);
  assert.same(result, 'held');
  assert.deepEqual(log, ['prefix', 'key']);
});
