// Exporting keeps the caller census open: the receiver can be the constructor or user data.
export function readDefault(source) {
  let M = source;
  if (!M) M = Array;
  const { from, of = 1 } = M;
  return [from, of];
}

export function readComputed(source) {
  let M = source;
  if (!M) M = Array;
  const key = 'of';
  const { from, [key]: of } = M;
  return [from, of];
}

export function readAfterInstance(source) {
  let M = source;
  if (!M) M = Array;
  const { name: first, of: value = [9].at(0) } = M;
  return [first, value];
}

export function readAfterInstanceRebind(source) {
  let M = source;
  if (!M) M = Array;
  const { name: first, of: value = (M = {}, 9), from: tail } = M;
  return [first, value, tail];
}

export function readAfterInstanceEdge(source, after) {
  let M = source;
  if (!M) M = Array;
  if (after) {
    const { name: first, before = (M = {}, 6), of: value = 9 } = M;
    return [first, before, value];
  }
  const { name: first, of: value = (M = {}, 9), extra } = M;
  return [first, value, extra];
}

QUnit.test('guarded destructuring: static defaults and computed keys receive the polyfill', assert => {
  const defaulted = readDefault(globalThis.Array);
  assert.deepEqual(defaulted[0]([1]), [1]);
  assert.deepEqual(defaulted[1](2), [2]);
  const keyed = readComputed(globalThis.Array);
  assert.deepEqual(keyed[0]([3]), [3]);
  assert.deepEqual(keyed[1](4), [4]);
  let M = globalThis.Array;
  if (!M) M = Array;
  let defaults = 0;
  const { from, of: withDefault = (++defaults, 1) } = M;
  assert.deepEqual(from([2, 3]), [2, 3]);
  assert.deepEqual(withDefault(4, 5), [4, 5]);
  const key = 'of';
  const { from: first, [key]: computed } = M;
  assert.deepEqual(first([6]), [6]);
  assert.deepEqual(computed(7), [7]);
  let assigned;
  ({ of: assigned = (++defaults, 2) } = M);
  assert.deepEqual(assigned(8), [8]);
  assigned = first;
  assert.deepEqual(assigned([9]), [9]);
  assert.same(defaults, 0, 'a served static never runs the user default');
});

QUnit.test('guarded destructuring: foreign getters and live defaults keep their order', assert => {
  assert.deepEqual(readAfterInstance({ name: 'own', of: undefined }), ['own', 9]);
  assert.deepEqual(readAfterInstance(globalThis.Array)[1](2), [2]);
  assert.deepEqual(readAfterInstanceRebind({ name: 'own', of: undefined, from: 7 }), ['own', 9, 7]);
  assert.deepEqual(readAfterInstanceEdge({ name: 'own', of: undefined, extra: 7 }, false), ['own', 9, 7]);
  assert.deepEqual(readAfterInstanceEdge({ name: 'own', of: 4 }, true), ['own', 6, 4]);
  const effects = [];
  const user = {
    get from() { effects.push('from'); return 7; },
    get of() { effects.push('of'); return undefined; },
  };
  function read(source) {
    let M = source;
    if (!M) M = Array;
    const { from, of: value = (effects.push('default'), [9].at(0)) } = M;
    return [from, value];
  }
  assert.deepEqual(read(user), [7, 9]);
  assert.deepEqual(effects, ['from', 'of', 'default'], 'each source slot is read once');
  effects.length = 0;
  function computed(source) {
    let M = source;
    if (!M) M = Array;
    const key = 'of';
    const { [key]: value = (effects.push('default'), 3), from } = M;
    return [value, from];
  }
  assert.deepEqual(computed(user), [3, 7]);
  assert.deepEqual(effects, ['of', 'default', 'from']);
  assert.deepEqual(read({ from: 4, of: null }), [4, null], 'null does not run a default');
  assert.deepEqual(read({ from: 5, of: 0 }), [5, 0], 'a falsy own value is preserved');
});

QUnit.test('guarded destructuring: a default preserves the receiver for later slots and the result', assert => {
  const effects = [];
  function read(source) {
    let M = source;
    if (!M) M = Array;
    const { of: value = (M = { from: 99 }, 3), from } = M;
    return [value, from];
  }
  const user = {
    get of() { effects.push('of'); return undefined; },
    get from() { effects.push('from'); return 7; },
  };
  assert.deepEqual(read(user), [3, 7]);
  assert.deepEqual(effects, ['of', 'from']);
  function assign(source) {
    let M = source;
    if (!M) M = Array;
    let value;
    const result = { of: value = (M = {}, 5) } = M;
    return [value, result === source];
  }
  assert.deepEqual(assign(user), [5, true], 'the assignment yields its original RHS');
  function edgeBefore(source) {
    let M = source;
    if (!M) M = Array;
    const { of: value = (M = {}, 5), extra } = M;
    return [value, extra];
  }
  assert.deepEqual(edgeBefore({ of: undefined, extra: 7 }), [5, 7]);
  function edgeAfter(source) {
    let M = source;
    if (!M) M = Array;
    const { before = (M = {}, 6), of: value = 9 } = M;
    return [before, value];
  }
  assert.deepEqual(edgeAfter({ of: 4 }), [6, 4]);
});

// Post-only detection receives Babel's already-lowered anonymous defaults without inferred names.
// The source-level differential and the other phases check our preservation of those names.
const testNamedDefault = typeof E2E_DETECT_LOWERED === 'undefined'
  && Object.getOwnPropertyDescriptor(() => { /* empty */ }, 'name') ? QUnit.test : QUnit.skip;
testNamedDefault('guarded destructuring: anonymous defaults retain their binding names', assert => {
  function read(source) {
    let M = source;
    if (!M) M = Array;
    const { of: arrow = () => 1 } = M;
    const { from: fn = function () { return 2; } } = M;
    return [arrow.name, fn.name, arrow(), fn()];
  }
  assert.deepEqual(read({}), ['arrow', 'fn', 1, 2]);
});

export function readAssignedAfterInstance(source, first, value, tail) {
  const effects = [];
  let M = source;
  if (!M) M = Array;
  ({ name: first, of: value = (effects.push('default'), M = {}, 9), from: tail } = M);
  return [first, value, tail, effects];
}

export function readValueBeforeNative(source) {
  let M = source;
  if (!M) M = Array;
  let value, extra;
  const result = { of: value = (M = {}, 9), extra } = M;
  return [value, extra, result === source];
}

export function readValueAfterNative(source) {
  let M = source;
  if (!M) M = Array;
  let before, value;
  const result = { before = (M = {}, 6), of: value = 9 } = M;
  return [before, value, result === source];
}

export function readIntoSource(source, defaulted) {
  let M = source;
  if (!M) M = Array;
  let first, tail;
  if (defaulted) ({ name: first, of: M = 9, from: tail } = M);
  else ({ of: M, from: tail } = M);
  return [M, tail, first];
}

QUnit.test('guarded destructuring: queued assignments retain live writes and defaults', assert => {
  assert.deepEqual(readAssignedAfterInstance({ name: 'own', of: undefined, from: 7 }), ['own', 9, 7, ['default']]);
  assert.deepEqual(readAssignedAfterInstance({ name: 'own', of: null, from: 7 }), ['own', null, 7, []]);
  const polyfilled = readAssignedAfterInstance(globalThis.Array);
  assert.deepEqual(polyfilled[1](3), [3]);
  assert.deepEqual(polyfilled[2]([4]), [4]);
  assert.deepEqual(polyfilled[3], [], 'a served guard does not run its raw default');
});

QUnit.test('guarded destructuring: value assignments keep their native sibling and original RHS', assert => {
  assert.deepEqual(readValueBeforeNative({ of: undefined, extra: 7 }), [9, 7, true]);
  assert.deepEqual(readValueBeforeNative({ of: null, extra: 7 }), [null, 7, true]);
  assert.deepEqual(readValueAfterNative({ of: 4 }), [6, 4, true]);
  const before = readValueBeforeNative(globalThis.Array);
  assert.deepEqual(before[0](3), [3]);
  assert.same(before[2], true);
  const after = readValueAfterNative(globalThis.Array);
  assert.deepEqual(after[1](4), [4]);
  assert.same(after[2], true);
});

QUnit.test('guarded destructuring: assigning into the source retains later reads', assert => {
  assert.deepEqual(readIntoSource({ of: 3, from: 7 }, false), [3, 7, undefined]);
  assert.deepEqual(readIntoSource({ of: undefined, from: 7, name: 'own' }, true), [9, 7, 'own']);
  assert.deepEqual(readIntoSource({ of: null, from: 7, name: 'own' }, true), [null, 7, 'own']);
  const polyfilled = readIntoSource(globalThis.Array, true);
  assert.deepEqual(polyfilled[0](3), [3]);
  assert.deepEqual(polyfilled[1]([4]), [4]);
});

QUnit.test('guarded destructuring: a defined foreign getter is read once', assert => {
  let reads = 0;
  const result = readDefault({ from: 7, get of() { return ++reads; } });
  assert.deepEqual(result, [7, 1]);
  assert.same(reads, 1);
});

export function readLiveDefaultSplit(source) {
  let M = source;
  if (!M) M = Array;
  const { name: first, of: value = (M = {}, [9].at(0)), from: tail } = M;
  return [first, value, tail];
}

QUnit.test('guarded destructuring: a split declaration keeps a default method call live', assert => {
  assert.deepEqual(readLiveDefaultSplit({ name: 'own', of: undefined, from: 7 }), ['own', 9, 7]);
  const polyfilled = readLiveDefaultSplit(globalThis.Array);
  assert.deepEqual(polyfilled[1](3), [3]);
  assert.deepEqual(polyfilled[2]([4]), [4]);
});

export function readSingleIntoSource(source) {
  let M = source;
  if (!M) M = Array;
  const result = { of: M } = M;
  return [M, result === source];
}

export function readNativeWriteBeforeStatic(source) {
  let M = source;
  if (!M) M = Array;
  let value;
  ({ extra: M, of: value } = M);
  return [M, value];
}

export function readNativeDefaultBeforeStatic(source) {
  let M = source;
  if (!M) M = Array;
  const { before = (M = {}, 6), of: value } = M;
  return [before, value];
}

QUnit.test('guarded destructuring: plain guards retain sources written by any sibling', assert => {
  assert.deepEqual(readSingleIntoSource({ of: 3 }), [3, true]);
  const polyfilled = readSingleIntoSource(globalThis.Array);
  assert.deepEqual(polyfilled[0](3), [3]);
  assert.same(polyfilled[1], true);
  assert.deepEqual(readNativeWriteBeforeStatic({ extra: 7, of: 3 }), [7, 3]);
  assert.deepEqual(readNativeWriteBeforeStatic(globalThis.Array)[1](4), [4]);
  assert.deepEqual(readNativeDefaultBeforeStatic({ of: 3 }), [6, 3]);
  assert.deepEqual(readNativeDefaultBeforeStatic(globalThis.Array)[1](5), [5]);
});

export function readConsumedDefaultBeforeStatic(source) {
  let M = source;
  if (!M) M = Array;
  const { name: first = (M = {}, 'fallback'), of: value } = M;
  return [first, value];
}

QUnit.test('guarded destructuring: an earlier extracted default retains the static source', assert => {
  assert.deepEqual(readConsumedDefaultBeforeStatic({ of: 3 }), ['fallback', 3]);
  const polyfilled = readConsumedDefaultBeforeStatic(globalThis.Array);
  assert.deepEqual(polyfilled[1](4), [4]);
});

export function readParameterCapture(source) {
  let M = source;
  if (!M) M = Array;
  let value;
  let depth = 0;
  function inner(arg = { of: value = ++depth === 1 ? (M = { of: 7 }, inner(), 9) : 9 } = M) {
    return [typeof value === 'function' ? value(3) : value, arg === source];
  }
  return inner();
}

QUnit.test('guarded destructuring: parameter memos belong to each activation', assert => {
  assert.deepEqual(readParameterCapture({ of: undefined }), [9, true]);
  assert.deepEqual(readParameterCapture(globalThis.Array), [[3], true]);
});

// The exported reader is open: a slot default does not constrain supplied receivers.
export function readDefaultedIteratedReceiver(external, target, onDefault) {
  const [{ at } = (onDefault(), [1])] = external;
  return at.call(target, 0);
}

QUnit.test('iteration: an open slot keeps its native default and dispatches the selected receiver', assert => {
  let defaults = 0;
  function onDefault() { defaults++; }
  assert.same(readDefaultedIteratedReceiver(['text'], 'ok', onDefault), 'o');
  assert.same(defaults, 0);
  assert.same(readDefaultedIteratedReceiver([undefined], [7], onDefault), 7);
  assert.same(readDefaultedIteratedReceiver([], [8], onDefault), 8);
  assert.same(defaults, 2);
  let getters = 0;
  let calls = 0;
  const receiver = { get at() {
    getters++;
    return function () {
      calls++;
      return 'own';
    };
  } };
  assert.same(readDefaultedIteratedReceiver([receiver], null, onDefault), 'own');
  assert.same(getters, 1);
  assert.same(calls, 1);
  assert.same(defaults, 2);
  assert.throws(() => readDefaultedIteratedReceiver([null], null, onDefault), TypeError);
  assert.same(defaults, 2);
});
