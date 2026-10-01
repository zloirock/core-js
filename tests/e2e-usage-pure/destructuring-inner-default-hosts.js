import { restoreProperty, withTemporaryProperty } from '../helpers/restore-property.cjs';

// External replacements distinguish a receiver mirror from a native-first leaf default.
function withPatchedDefaults(run) {
  function NativeSet() { /* empty */ }
  let result;
  withTemporaryProperty(globalThis, 'Set', NativeSet, () => {
    withTemporaryProperty(Array, 'of', () => 'native-of', () => {
      const nativePromise = Object.getOwnPropertyDescriptor(globalThis, 'Promise')?.value;
      withTemporaryProperty(nativePromise || {}, 'race', () => 'native-race', () => { result = run(); });
    });
  });
  return result;
}

export function readAssignment(source) {
  let Ctor, dash, of;
  // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
  [{ Set: Ctor = 'ctor-default', 'with-dash': dash, Array: { of = 'of-default' } } = globalThis] = source;
  return [Ctor, dash, of];
}

export function readMixed(source) {
  let of, dash, race;
  // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
  [{ Array: { of = 'of-default' }, 'with-dash': dash, Promise: { race = 'race-default' } } = globalThis] = source;
  return [of, dash, race];
}

export function readWrapped(source) {
  const [{ Set: Ctor = 'ctor-default', 'with-dash': dash, Array: { of = 'of-default' } } = globalThis] = source;
  return [Ctor, dash, of];
}

export function readRest(source) {
  let Ctor, of, rest;
  // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
  [{ Set: Ctor = 'ctor-default', Array: { of = 'of-default' }, ...rest } = globalThis] = source;
  return [Ctor, of, rest];
}

QUnit.test('inner default: an assignment mirrors statics beside a quoted key', assert => {
  const result = withPatchedDefaults(() => {
    let Ctor, dash, of;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    [{ Set: Ctor, 'with-dash': dash, Array: { of } } = globalThis] = [];
    return [Ctor === Set, dash, of(3)];
  });
  assert.deepEqual(result, [true, undefined, [3]]);
});

QUnit.test('inner default: mixed static leaves mirror beside a quoted key', assert => {
  const result = withPatchedDefaults(() => {
    let of, dash, race;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    [{ Array: { of }, 'with-dash': dash, Promise: { race } } = globalThis] = [];
    return [of(4), dash, typeof race.call(Promise, [Promise.resolve(4)]).then];
  });
  assert.deepEqual(result, [[4], undefined, 'function']);
});

QUnit.test('inner default: an array-wrapped declaration mirrors statics beside a quoted key', assert => {
  const result = withPatchedDefaults(() => {
    const [{ Set: Ctor, 'with-dash': dash, Array: { of } } = globalThis] = [];
    return [Ctor === Set, dash, of(5)];
  });
  assert.deepEqual(result, [true, undefined, [5]]);
});

QUnit.test('inner default: a declined rest mirror retains native values and exclusions', assert => {
  Object.getOwnPropertyDescriptors(globalThis);
  const present = withPatchedDefaults(() => {
    const nativeCtor = Object.getOwnPropertyDescriptor(globalThis, 'Set').value;
    let Ctor, of, rest;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    [{ Set: Ctor, Array: { of }, ...rest } = globalThis] = [];
    return [Ctor === nativeCtor, of(), Object.hasOwn(rest, 'Set'), Object.hasOwn(rest, 'Array')];
  });
  if (typeof E2E_POST_LOWERED === 'undefined') assert.deepEqual(present, [true, 'native-of', false, false]);
  else assert.deepEqual(present.slice(2), [false, false]);
  let result;
  withTemporaryProperty(globalThis, 'Set', undefined, () => {
    withTemporaryProperty(Array, 'of', undefined, () => {
      let Ctor, of, rest;
      // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
      [{ Set: Ctor, Array: { of }, ...rest } = globalThis] = [];
      // A post pass can serve member reads exposed by lowering the native pattern.
      result = [typeof Ctor, typeof of, Object.hasOwn(rest, 'Set'), Object.hasOwn(rest, 'Array')];
    });
  });
  if (typeof E2E_POST_LOWERED === 'undefined') assert.deepEqual(result, ['undefined', 'undefined', false, false]);
  else assert.deepEqual(result.slice(2), [false, false]);
});

QUnit.test('inner default: supplied values retain their getters and user defaults', assert => {
  const events = [];
  const supplied = {
    get Set() { events.push('set'); return undefined; },
    get 'with-dash'() { events.push('dash'); return 6; },
    get Array() {
      events.push('array');
      return {
        get of() { events.push('of'); return undefined; },
      };
    },
  };
  function read(source) {
    const [{ Set: Ctor = (events.push('ctor-default'), 7), 'with-dash': dash, Array: { of = (events.push('of-default'), 8) } } = globalThis] = source;
    return [Ctor, dash, of];
  }
  assert.deepEqual(read([supplied]), [7, 6, 8]);
  assert.deepEqual(events, ['set', 'ctor-default', 'dash', 'array', 'of', 'of-default']);
  const [{ Set: Ctor, 'with-dash': dash, Array: { of } } = globalThis] = [{ Set: undefined, 'with-dash': 9, Array: { of: undefined } }];
  assert.deepEqual([Ctor, dash, of], [undefined, 9, undefined]);
});

QUnit.test('inner default: all four hosts retain supplied undefined slots and user defaults', assert => {
  const source = [{ Set: undefined, 'with-dash': 6, Array: { of: undefined }, Promise: { race: undefined }, marker: 14 }];
  assert.deepEqual(readAssignment(source), ['ctor-default', 6, 'of-default']);
  assert.deepEqual(readWrapped(source), ['ctor-default', 6, 'of-default']);
  assert.deepEqual(readMixed(source), ['of-default', 6, 'race-default']);
  const [Ctor, of, rest] = readRest(source);
  assert.deepEqual([Ctor, of, rest.marker, Object.hasOwn(rest, 'Set'), Object.hasOwn(rest, 'Array')], ['ctor-default', 'of-default', 14, false, false]);
});

QUnit.test('inner default: an explicit undefined receiver takes the mirrored default', assert => {
  const result = withPatchedDefaults(() => {
    const assignment = readAssignment([undefined]);
    const wrapped = readWrapped([undefined]);
    const mixed = readMixed([undefined]);
    return [assignment[2](1), wrapped[2](2), mixed[0](3)];
  });
  assert.deepEqual(result, [[1], [2], [3]]);
});

// Pending the common receiver-mirror read-order fix, shared with identifier keys.
QUnit.skip('inner default: a symbol-label getter follows its effectful key', assert => {
  const events = [];
  const row = [0, 1, 2];
  Object.defineProperty(row, '[@@iterator]', {
    get() {
      events.push('tag');
      return 7;
    },
  });
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the row owns this test property
  function read({ [Symbol.iterator]: iter, [(events.push('key'), '[@@iterator]')]: tag, at } = row) {
    return [tag, at.call(row, -1), iter.call(row).next().value];
  }
  assert.deepEqual(read(), [7, 2, 0]);
  assert.deepEqual(events, ['key', 'tag']);
});

QUnit.skip('inner default: an aliased symbol-label getter follows its effectful key', assert => {
  const events = [];
  const row = [0, 1, 2];
  const { iterator: symbolKey } = Symbol;
  Object.defineProperty(row, '[@@iterator]', {
    get() {
      events.push('tag');
      return 7;
    },
  });
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the row owns this test property
  function read({ [symbolKey]: iter, [(events.push('key'), '[@@iterator]')]: tag, at } = row) {
    return [tag, at.call(row, -1), iter.call(row).next().value];
  }
  assert.deepEqual(read(), [7, 2, 0]);
  assert.deepEqual(events, ['key', 'tag']);
});

// Pending the common receiver-mirror read-order fix, shared with identifier keys.
QUnit.skip('inner default: quoted passthrough getters run after their key and preceding write', assert => {
  let Ctor = 0;
  let dash;
  let of;
  const events = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'with-dash');
  restoreProperty(globalThis, 'with-dash', {
    configurable: true,
    get() {
      events.push(typeof Ctor);
      return 10;
    },
  });
  try {
    [{ Set: Ctor, [(events.push('key'), 'with-dash')]: dash, Array: { of } } = globalThis] = [];
    assert.deepEqual(events, ['key', 'function']);
    assert.same(dash, 10);
    assert.deepEqual(of(11), [11]);
  } finally {
    restoreProperty(globalThis, 'with-dash', previous);
  }
});

QUnit.test('inner default: a prototype key is an own mirror property', assert => {
  const [{ Array: { of }, __proto__: prototype } = globalThis] = [];
  assert.same(prototype, Reflect.get(globalThis, '__proto__'));
  assert.deepEqual(of(13), [13]);
});

// Pending the common receiver-mirror read-order and repeated-read fix.
QUnit.skip('inner default: a quoted mirror preserves repeated identifier getters and key order', assert => {
  const events = [];
  let reads = 0;
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'fc587Sibling');
  const previousMarker = Object.getOwnPropertyDescriptor(globalThis, 'fc587Receiver');
  // VM global accessors can receive the sandbox behind the global proxy. An own marker
  // tests the native receiver without depending on that wrapper's identity.
  restoreProperty(globalThis, 'fc587Receiver', { configurable: true, value: 17 });
  restoreProperty(globalThis, 'fc587Sibling', {
    configurable: true,
    get() {
      events.push(`get${ ++reads }`);
      return this.fc587Receiver === 17 ? reads : -1;
    },
  });
  try {
    const [{ Array: { of }, [(events.push('key'), 'with-dash')]: dash, fc587Sibling: first, fc587Sibling: second } = globalThis] = [];
    assert.deepEqual([of(14), dash, first, second], [[14], undefined, 1, 2]);
    assert.deepEqual(events, ['key', 'get1', 'get2']);
  } finally {
    restoreProperty(globalThis, 'fc587Sibling', previous);
    restoreProperty(globalThis, 'fc587Receiver', previousMarker);
  }
});

QUnit.test('inner default: bracket-shaped string keys remain literal and preserve defaults', assert => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, '[missing]');
  restoreProperty(globalThis, '[missing]', { configurable: true, get() { return undefined; } });
  try {
    const [{ Array: { of }, '[missing]': value = of(12) } = globalThis] = [];
    assert.deepEqual(value, [12]);
  } finally {
    restoreProperty(globalThis, '[missing]', previous);
  }
});
