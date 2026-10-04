// Exported inputs remain unknown to the caller census, so instance reads use their dispatch.
export function readRetainedInstancePair(input) {
  const { row: { at, includes } } = { row: input };
  return [at, includes];
}

export function readRetainedComputedInstance(input, effect) {
  const { row: { [(effect(), 'at')]: at, other } } = { row: input };
  return [at, other];
}

export function readRetainedIteratorPair(input) {
  const { row: { at, [Symbol.iterator]: iter } } = { row: input };
  return [at, iter];
}

export function readRetainedOuterKey(input, effect) {
  const { row: { at }, [(effect(), 'other')]: other } = input;
  return [at, other];
}

export function readRetainedStringIteratorKey(input) {
  // eslint-disable-next-line no-useless-computed-key -- the computed spelling exercises symbol-slot classification
  const { ['[@@iterator]']: { other, at } } = input;
  return [other, at];
}

QUnit.test('destructuring capture: a string iterator label retains ordinary getter order', assert => {
  const events = [];
  const input = {
    get '[@@iterator]'() {
      events.push('row');
      return {
        get other() { events.push('other'); return 7; },
        get at() { events.push('at'); return 8; },
      };
    },
  };
  assert.deepEqual(readRetainedStringIteratorKey(input), [7, 8]);
  assert.deepEqual(events, ['row', 'other', 'at'], 'the string key names an ordinary property');
  const array = [7, 8];
  const [, at] = readRetainedStringIteratorKey({ '[@@iterator]': array });
  assert.same(at.call(array, -1), 8, 'an array receiver still receives its instance polyfill');
});

QUnit.test('destructuring capture: symbol and string labels remain separate in a default mirror', assert => {
  const events = [];
  const row = [1, 2];
  Object.defineProperty(row, '[@@iterator]', {
    get() {
      events.push('tag');
      return 7;
    },
  });
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the row owns this test property
  function read({ [Symbol.iterator]: iter, '[@@iterator]': tag, at } = row) {
    return [tag, at.call(row, -1), iter.call(row).next().value];
  }
  assert.deepEqual(read(), [7, 2, 1]);
  assert.deepEqual(events, ['tag'], 'the symbol entry cannot consume the string property');
});

QUnit.test('destructuring capture: dispatch rejects null while computed keys retain their earlier rejection', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return 7; },
    get includes() { events.push('includes'); return 8; },
    get other() { events.push('other'); return 9; },
  };
  assert.deepEqual(readRetainedInstancePair(source), [7, 8]);
  assert.deepEqual(events, ['at', 'includes'], 'both getters run once in source order');
  assert.deepEqual(readRetainedComputedInstance(source, () => events.push('key')), [7, 9]);
  assert.deepEqual(events, ['at', 'includes', 'key', 'at', 'other']);
  for (const input of [null, undefined]) {
    assert.throws(() => readRetainedInstancePair(input), TypeError, 'the first dispatch rejects a nullish receiver');
    assert.throws(() => readRetainedComputedInstance(input, () => events.push('unreachable')), TypeError);
  }
  // Standalone Babel lowering already evaluates the key before its member read.
  assert.same(events.length, typeof E2E_DETECT_LOWERED === 'undefined' ? 5 : 7, 'the source and lowered key orders remain observable');
});

export function readRetainedArrayWrapper(input, effect) {
  // eslint-disable-next-line no-unreachable-loop -- the loop head supplies the wrapper's constructor receiver
  for (const Ctor of [Array]) {
    const [{ [(effect(), 'of')]: of, from }, { at, length }] = [Ctor, input];
    return [of(1)[0], from([2])[0], at, length];
  }
}

QUnit.test('destructuring capture: an array wrapper keeps opaque leaf getter order', assert => {
  const events = [];
  const input = {
    get at() { events.push('at'); return 7; },
    get length() { events.push('length'); return 9; },
  };
  assert.deepEqual(readRetainedArrayWrapper(input, () => events.push('key')), [1, 2, 7, 9]);
  assert.deepEqual(events, ['key', 'at', 'length'], 'the native sibling cannot overtake the instance dispatch');
});

export function readRetainedArrayWrapperMember(holder, effect) {
  // eslint-disable-next-line no-unreachable-loop -- the loop head supplies the constructor receiver
  for (const Ctor of [Array]) {
    const [{ [(effect(), 'of')]: of, from }, { at, length }] = [Ctor, holder.value];
    return [of(1)[0], from([2])[0], at, length];
  }
}

export function readRetainedArrayWrapperRebound(input, replacement) {
  function effect() { input = replacement; }
  // eslint-disable-next-line no-unreachable-loop -- the loop head supplies the constructor receiver
  for (const Ctor of [Array]) {
    const [{ [(effect(), 'of')]: of, from }, { at, length }] = [Ctor, input];
    return [of(1)[0], from([2])[0], at, length];
  }
}

QUnit.test('destructuring capture: a retained wrapper snapshots its member source', assert => {
  const events = [];
  const input = {
    get at() { events.push('at'); return 7; },
    get length() { events.push('length'); return 9; },
  };
  const holder = {
    get value() { events.push('value'); return input; },
  };
  assert.deepEqual(readRetainedArrayWrapperMember(holder, () => events.push('key')), [1, 2, 7, 9]);
  assert.deepEqual(events, ['value', 'key', 'at', 'length'], 'the wrapper member is read once');
});

// Standalone Babel lowers this literal's second RHS read after the first pattern's key.
// Post receives that replaced value; detection before lowering must retain the original one.
QUnit[typeof E2E_DETECT_LOWERED === 'undefined' ? 'test' : 'skip']('destructuring capture: a retained wrapper snapshots a rebound name', assert => {
  const events = [];
  const input = {
    get at() { events.push('at'); return 7; },
    get length() { events.push('length'); return 9; },
  };
  assert.deepEqual(readRetainedArrayWrapperRebound(input, { at: 3, length: 4 }), [1, 2, 7, 9]);
  assert.deepEqual(events, ['at', 'length'], 'an earlier key cannot replace the captured sibling');
});

QUnit.test('destructuring capture: native outer reads and iterator dispatch keep their source order', assert => {
  const events = [];
  const row = {
    get at() { events.push('at'); return 7; },
    get [Symbol.iterator]() { events.push('iterator'); return 8; },
  };
  assert.deepEqual(readRetainedIteratorPair(row), [7, 8]);
  const input = {
    get row() { events.push('row'); return row; },
    get other() { events.push('other'); return 9; },
  };
  assert.deepEqual(readRetainedOuterKey(input, () => events.push('key')), [7, 9]);
  assert.deepEqual(events, ['at', 'iterator', 'row', 'at', 'key', 'other']);
  for (const value of [null, undefined]) {
    assert.throws(() => readRetainedOuterKey(value, () => events.push('unreachable')), TypeError);
  }
  assert.same(events.length, 6, 'the native outer read rejects null before the later key');
});

export function readNormalizedSiblingReceiver(input) {
  const source = input;
  const [{ lead, y: { at, extra }, top }] = [source];
  return [lead, at, extra, top];
}

export function readRetainedPrefixedReceiver(input, before, key) {
  const source = input;
  const { [(key(), 'at')]: at, length } = (before(), source);
  return [at, length];
}

QUnit.test('destructuring capture: a reused name keeps its complete receiver prefix', assert => {
  const events = [];
  const input = {
    get at() { events.push('at'); return 7; },
    get length() { events.push('length'); return 9; },
  };
  assert.deepEqual(readRetainedPrefixedReceiver(input, () => events.push('prefix'), () => events.push('key')), [7, 9]);
  assert.deepEqual(events, ['prefix', 'key', 'at', 'length']);
});

QUnit.test('destructuring capture: normalized sibling reads reuse a constant source', assert => {
  const events = [];
  const input = {
    get lead() { events.push('lead'); return 1; },
    get y() {
      events.push('y');
      return {
        get at() { events.push('at'); return 7; },
        get extra() { events.push('extra'); return 2; },
      };
    },
    get top() { events.push('top'); return 3; },
  };
  assert.deepEqual(readNormalizedSiblingReceiver(input), [1, 7, 2, 3]);
  assert.deepEqual(events, ['lead', 'y', 'at', 'extra', 'top'], 'every property is read once in source order');
  for (const source of [null, undefined]) assert.throws(() => readNormalizedSiblingReceiver(source), TypeError);
});

export function readNestedRetainedReceiver(input, nested) {
  let source = input;
  input.onRead = () => {
    if (nested) readNestedRetainedReceiver(nested);
    source = { at: () => 'replacement' };
  };
  const { row: { other, at } } = { row: source };
  return [other, at()];
}

QUnit.test('destructuring capture: nested declaration reads each getter once during reentry', assert => {
  const events = [];
  function make(label) {
    return {
      get other() {
        events.push(`${ label }:other`);
        this.onRead();
        return label;
      },
      get at() { events.push(`${ label }:at`); return () => label; },
    };
  }
  assert.deepEqual(readNestedRetainedReceiver(make('outer'), make('inner')), ['outer', 'outer']);
  assert.deepEqual(events, ['outer:other', 'inner:other', 'inner:at', 'outer:at']);
});

QUnit.test('destructuring capture: catch receiver stays local during getter reentry', assert => {
  const events = [];
  function read(label) {
    const source = {
      get inner() {
        events.push(`${ label }:inner`);
        if (label === 'outer') read('inner');
        return [label];
      },
      get flat() {
        events.push(`${ label }:flat`);
        return label;
      },
    };
    try {
      throw source;
    } catch ({ inner: [first], flat }) {
      assert.same(first, label, 'the nested array reads the caught value');
      assert.same(flat, label, 'the later dispatch keeps the same caught value');
    }
  }
  read('outer');
  assert.deepEqual(events, ['outer:inner', 'inner:inner', 'inner:flat', 'outer:flat']);
  assert.throws(() => {
    try {
      throw null;
    } catch ({ inner: [first], [(events.push('unreachable'), 'flat')]: flat }) {
      assert.same(first, flat);
    }
  }, TypeError, 'the first native read still rejects null before the later key');
  assert.same(events.length, 4, 'the null receiver prevents the later key effect');

  events.length = 0;
  function readNestedCatch(label) {
    try {
      throw {
        get w() {
          events.push(`${ label }:w`);
          if (label === 'outer') readNestedCatch('inner');
          return {
            get at() { events.push(`${ label }:at`); return () => label; },
          };
        },
      };
    } catch ({ [(events.push(`${ label }:key`), 'w')]: { at } }) {
      return at();
    }
  }
  assert.same(readNestedCatch('outer'), 'outer', 'the nested read keeps this catch activation');
  assert.deepEqual(events, ['outer:key', 'outer:w', 'inner:key', 'inner:w', 'inner:at', 'outer:at']);
});

// Standalone Babel lowering runs a catch pattern's first computed key before rejecting null.
// Post receives that already executed key; the source-level capture keeps the native assertion.
QUnit[typeof E2E_DETECT_LOWERED === 'undefined' ? 'test' : 'skip']('destructuring capture: null catch receiver rejects its first key', assert => {
  const events = [];
  assert.throws(() => {
    try {
      throw null;
    } catch ({ [(events.push('unreachable'), 'w')]: { at } }) {
      at();
    }
  }, TypeError, 'the reused catch receiver rejects null before its first computed key');
  assert.same(events.length, 0, 'the first key stays unreachable on null');
});

QUnit.test('destructuring capture: a source alias is snapshotted before a getter rebinds it', assert => {
  const events = [];
  function read() {
    let source = {
      get other() {
        events.push('other');
        source = { at: () => 'replacement' };
        return 7;
      },
      get at() {
        events.push('at');
        return () => 'original';
      },
    };
    const { other, at } = source;
    assert.same(other, 7);
    assert.same(at(), 'original', 'the claimed read uses the original receiver');
    assert.same(source.at(), 'replacement', 'the source alias really changed');
  }
  read();
  assert.deepEqual(events, ['other', 'at'], 'each source getter runs once in order');
});

QUnit.test('destructuring capture: assignment and nested rest keep receiver effects', assert => {
  const events = [];
  const source = {
    get name() { events.push('name'); return 'user'; },
    get values() { events.push('values'); return () => 9; },
  };
  let name, values;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  ({ name, values } = source || Object);
  assert.same(name, 'user');
  assert.same(values(), 9);
  const { x: { [(events.push('key'), 'from')]: make, ...rest } } = (events.push('receiver'), { x: Array });
  assert.deepEqual(make([1, 2]), [1, 2]);
  assert.same('from' in rest, false, 'rest preserves the exclusion');
  for (const { from: loopMake, ...loopRest } of [Array]) assert.deepEqual([loopMake([3])[0], 'from' in loopRest], [3, false]);
  assert.deepEqual(events, ['name', 'values', 'receiver', 'key']);
});

QUnit.test('destructuring capture: a later static keeps its guard beside instance reads', assert => {
  for (const supplied of [false, true]) {
    const events = [];
    let M = Map;
    if (supplied) M = {
      get at() { events.push('at'); return 8; },
      get name() { events.push('name'); return 'user'; },
      get groupBy() { events.push('groupBy'); return 7; },
    };
    let other, name, method;
    // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
    ({ at: other, name, groupBy: method } = M);
    if (supplied) assert.same(name, 'user');
    else assert.same(typeof name, 'string', 'the constructor name is read through the instance helper');
    assert.same(other, supplied ? 8 : undefined);
    if (supplied) assert.same(method, 7, 'the user static is read once');
    else assert.deepEqual(method([1, 2], value => value % 2).get(1), [1], 'the constructor static is polyfilled');
    assert.deepEqual(events, supplied ? ['at', 'name', 'groupBy'] : [], 'the source order is preserved');
  }
});

QUnit.test('destructuring capture: a queued assignment read shares its local receiver during reentry', assert => {
  const events = [];
  function read(label) {
    function receiver() {
      events.push(`${ label }:receiver`);
      return {
        get name() {
          events.push(`${ label }:name`);
          if (label === 'outer') read('inner');
          return label;
        },
        get values() {
          events.push(`${ label }:values`);
          return () => label;
        },
      };
    }
    let name, values;
    // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
    ({ name, values } = receiver() || Object);
    assert.same(name, label);
    assert.same(values(), label, 'the later getter reads this activation receiver');
  }
  read('outer');
  assert.deepEqual(events, ['outer:receiver', 'outer:name', 'inner:receiver', 'inner:name', 'inner:values', 'outer:values']);
});
