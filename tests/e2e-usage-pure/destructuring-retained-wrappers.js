/* eslint-disable no-sequences, unicorn/no-unreadable-iife -- Preserve the source wrappers and effects under test. */
import { restoreProperty, withTemporaryProperty } from '../helpers/restore-property.cjs';

// These mirrors need the original pattern. Post-only detection sees Babel's lowered
// member reads instead; the stripped Babel and pre+post legs exercise the absent natives.
const testUnlessDetectLowered = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

QUnit.test('destructuring: a retained element default does not hide an instance sibling', assert => {
  const events = [];
  const [{ isArray } = (events.push('default'), Array), { at }] = [undefined, [7, 8]];
  assert.true(isArray([]), 'the native static slot still reads its default receiver');
  assert.same(at.call([7, 8], -1), 8, 'the independent instance method is polyfilled');
  assert.deepEqual(events, ['default'], 'the receiver default runs once');
});

QUnit.test('destructuring: a retained wrapper does not replace a foreign receiver default', assert => {
  // eslint-disable-next-line es/no-nonstandard-symbol-properties -- the foreign default intentionally has no resolve method
  function wrapped([{ Promise: { resolve } = Symbol }] = [globalThis]) {
    return resolve;
  }
  function custom() {
    return 7;
  }
  assert.same(wrapped([{}]), undefined, 'the supplied missing slot reads Symbol.resolve');
  assert.same(wrapped([{ Promise: { resolve: custom } }]), custom, 'a supplied method keeps its identity');
});

QUnit.test('destructuring: a sole instance extraction carries its literal slot effects', assert => {
  const events = [];
  const { w: { [Symbol.iterator]: method } } = { w: (events.push('receiver'), globalThis) };
  assert.same(method, undefined, 'the receiver has no iterator method');
  assert.deepEqual(events, ['receiver'], 'the initializer effect runs exactly once');
});

QUnit.test('destructuring: an opaque default carries its constructor static', assert => {
  const events = [];
  function key() {
    events.push('key');
    return String(Math.random());
  }
  const { [key()]: { groupBy } = Map } = {};
  assert.same(groupBy([1, 2], value => value % 2).get(1)[0], 1);
  assert.deepEqual(events, ['key']);
});

QUnit.test('destructuring: a positional constructor read has no identity guard', assert => {
  function read(flag) {
    let Receiver = Map;
    if (flag) Receiver = Set;
    const [{ groupBy }] = [Receiver];
    return groupBy;
  }
  assert.same(read(false)([3], value => value).get(3)[0], 3);
  assert.same(read(true), undefined, 'the other constructor keeps its own missing slot');
});

QUnit.test('destructuring: a literal IIFE carries a static and preserves its effects', assert => {
  const events = [];
  const { C: { groupBy } } = (() => (events.push('return'), { C: Map }))();
  assert.same(groupBy([5], value => value).get(5)[0], 5);
  assert.deepEqual(events, ['return']);
});

QUnit.test('destructuring: a literal IIFE parameter default keeps the supplied receiver', assert => {
  const events = [];
  function read({ C: { groupBy } } = (() => (events.push('default'), { C: Map }))()) {
    return groupBy([7], value => value).get(7)[0];
  }
  assert.same(read(), 7);
  assert.throws(() => read({ C: undefined }), TypeError);
  assert.deepEqual(events, ['default'], 'a supplied value does not evaluate the default');
});

QUnit.test('destructuring: a literal IIFE loop element carries its static once', assert => {
  const events = [];
  for (const { C: { groupBy } } of [(() => (events.push('element'), { C: Map }))()]) {
    assert.same(groupBy([11], value => value).get(11)[0], 11);
    events.push('body');
  }
  assert.deepEqual(events, ['element', 'body']);
});

QUnit.test('destructuring: a computed container key precedes its later write', assert => {
  const rows = [];
  const key = String(rows.length);
  const { [key]: { groupBy } = Map } = {};
  rows.push(groupBy);
  assert.same(rows[0]([13], value => value).get(13)[0], 13);
});

QUnit.test('destructuring: loop binding position preserves a native wrapper', assert => {
  const events = [];
  for (const row of [{ C: Array, values: [3, 5] }]) {
    events.push('body');
    const { C: { isArray }, values: { at } } = row;
    assert.true(isArray([]), 'the native wrapper remains readable after another statement');
    assert.same(at.call([3, 5], -1), 5, 'an independent instance claim remains served');
  }
  let isArray, at;
  for ({ C: { isArray }, values: { at } } of [{ C: Array, values: [7] }]) {
    assert.true(isArray([]), 'the relocated assignment head preserves its static read');
    assert.same(at.call([7], 0), 7);
  }
  assert.deepEqual(events, ['body']);
});

QUnit.test('destructuring: a captured literal assignment retains its native static', assert => {
  const events = [];
  let isArray, at;
  // eslint-disable-next-line prefer-const -- preserve the assignment host under test
  ({ C: { isArray }, values: { at } } = (events.push('source'), { C: Array, values: [11] }));
  assert.true(isArray([]), 'the residual reads the same source after capture');
  assert.same(at.call([11], 0), 11);
  assert.deepEqual(events, ['source']);
});

QUnit.test('destructuring: an IIFE argument retains a native wrapper', assert => {
  const events = [];
  const isArray = (({ C: { isArray: method } }) => (events.push('body'), method))(
    (events.push('argument'), { C: Array }),
  );
  assert.true(isArray([]));
  assert.deepEqual(events, ['argument', 'body']);
});

QUnit.test('destructuring: a selected literal slot carries constructor statics', assert => {
  const { C: { groupBy } } = { C: globalThis.flagFalse ? Object : Map };
  assert.same(groupBy([13], value => value).get(13)[0], 13);
});

QUnit.test('destructuring: an inner literal default carries constructor statics', assert => {
  const events = [];
  function read(source) {
    const { W: { C: { groupBy: method } } = (events.push('default'), { C: globalThis.Map }) } = source;
    return method;
  }
  assert.same(read({})([17], value => value).get(17)[0], 17);
  assert.deepEqual(events, ['default']);
});

QUnit.test('destructuring: a literal parameter default keeps supplied instance dispatch', assert => {
  const events = [];
  function read([{ entries }] = [Object]) {
    return entries;
  }
  const values = [19, 23];
  withTemporaryProperty(Array.prototype, 'entries', undefined, () => {
    assert.deepEqual(Array.from(read([values]).call(values)), [[0, 19], [1, 23]], 'a supplied array receives its missing method');
  });
  assert.same(read(), Object.getOwnPropertyDescriptor(Object, 'entries')?.value, 'the default keeps its native static');
  function custom() {
    return 29;
  }
  assert.same(read([{ get entries() {
    events.push('get');
    return custom;
  } }]), custom);
  assert.throws(() => read([null]), TypeError);
  assert.deepEqual(events, ['get'], 'the supplied slot is read once');
});

QUnit.test('destructuring: a selecting literal default keeps supplied instance dispatch', assert => {
  function read([{ entries }] = [globalThis.flagFalse ? Object : {}]) {
    return entries;
  }
  const values = [31];
  withTemporaryProperty(Array.prototype, 'entries', undefined, () => {
    assert.deepEqual(Array.from(read([values]).call(values)), [[0, 31]]);
  });
});

testUnlessDetectLowered('destructuring: a paired selection keeps argument and binding effects', assert => {
  const events = [];
  const custom = { get from() {
    events.push('get');
    return function () {
      return this;
    };
  } };
  function read(flag, value) {
    return (([{ [(events.push('key'), 'from')]: from, missing = (events.push('default'), 7) }], extra) => {
      events.push('body');
      return [from, missing, extra];
    })([(events.push('source'), flag ? Array : value)], (events.push('argument'), 11));
  }
  withTemporaryProperty(Array, 'from', undefined, () => {
    const result = read(true, custom);
    assert.deepEqual(result[0]([3]), [3], 'the selected built-in works without its native static');
    assert.deepEqual(result.slice(1), [7, 11]);
    assert.deepEqual(events, ['source', 'argument', 'key', 'default', 'body']);
    events.length = 0;
    assert.same(read(false, custom)[0].call(custom), custom, 'the custom method keeps its receiver');
    assert.deepEqual(events, ['source', 'argument', 'key', 'get', 'default', 'body']);
    // Null-before-key ordering is locked before Babel's own destructuring lowering
    // in native-wrapper-preparation; that lowering violates it without our plugin too.
  });
});

testUnlessDetectLowered('destructuring: a nested selecting IIFE keeps generic branch support', assert => {
  function read(flag, value) {
    return (({ a: [{ hasOwn }] }) => hasOwn)({ a: [flag ? Object : value] });
  }
  function spread(flag, value) {
    // eslint-disable-next-line unicorn/no-useless-spread -- exercise the existing inline spread pairing
    return (([{ fromEntries }]) => fromEntries)(...[[flag ? Object : value]]);
  }
  withTemporaryProperty(Object, 'hasOwn', undefined, () => {
    assert.true(read(true, null)({ x: 1 }, 'x'));
    const custom = { hasOwn() { return 19; } };
    assert.same(read(false, custom), custom.hasOwn);
  });
  withTemporaryProperty(Object, 'fromEntries', undefined, () => {
    assert.deepEqual(spread(true, null)([['x', 23]]), { x: 23 });
    const custom = { fromEntries() { return 29; } };
    assert.same(spread(false, custom), custom.fromEntries);
  });
});

testUnlessDetectLowered('destructuring: a consumed selecting assignment keeps its receiver', assert => {
  const events = [];
  const custom = { get from() {
    events.push('get');
    return 31;
  } };
  function read(flag) {
    let from;
    const held = [{ from }] = [flag ? Array : custom];
    return [held[0], from];
  }
  withTemporaryProperty(Array, 'from', undefined, () => {
    const builtin = read(true);
    assert.same(builtin[0], Array, 'the consumed source is not a mirror literal');
    assert.deepEqual(builtin[1]([37]), [37], 'the flat read can be served after capture');
    assert.deepEqual(read(false), [custom, 31]);
    assert.deepEqual(events, ['get']);
  });
});

testUnlessDetectLowered('destructuring: a mirrored native getter sees preceding bindings', assert => {
  const events = [];
  function read(flag) {
    const descriptor = Object.getOwnPropertyDescriptor(Array, 'includes');
    try {
      Object.defineProperty(Array, 'includes', { configurable: true, get() {
        events.push('get');
        return from;
      } });
      const { w: { from, includes } } = { w: flag ? Array : { from: 17, includes: 23 } };
      return [from, includes];
    } finally {
      restoreProperty(Array, 'includes', descriptor);
    }
  }
  withTemporaryProperty(Array, 'from', undefined, () => {
    const values = read(true);
    assert.deepEqual(values[0]([3]), [3]);
    assert.same(values[1], values[0], 'the getter runs after from is initialized');
    assert.deepEqual(read(false), [17, 23]);
    assert.deepEqual(events, ['get']);
  });
});

testUnlessDetectLowered('destructuring: a wrapped optional receiver keeps generic branch support', assert => {
  function read() {
    const { a: { of } } = { a: globalThis.window?.self.Array };
    return of;
  }
  withTemporaryProperty(globalThis, 'window', globalThis, () => {
    withTemporaryProperty(globalThis, 'self', globalThis, () => {
      withTemporaryProperty(Array, 'of', undefined, () => {
        assert.deepEqual(read()(5), [5]);
      });
    });
  });
});

testUnlessDetectLowered('destructuring: an opted-out mirrored slot keeps its native read', assert => {
  const events = [];
  function custom() {
    events.push('custom');
    return 41;
  }
  function read({
    from,
    // core-js-disable-next-line
    of,
  } = Array) {
    return [from([3]), of()];
  }
  withTemporaryProperty(Array, 'from', undefined, () => {
    withTemporaryProperty(Array, 'of', custom, () => {
      assert.deepEqual(read(), [[3], 41]);
      assert.deepEqual(events, ['custom']);
    });
  });
});

testUnlessDetectLowered('destructuring: a partial mirror preserves null rejection and the retained slot', assert => {
  // The computed-key boundary is checked before lowering in native-wrapper-preparation.
  // eslint-disable-next-line no-unsafe-optional-chaining -- the null receiver must still throw
  function read({ of, length } = globalThis.window?.self.Array) {
    return [of(7), length];
  }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  if (!descriptor || descriptor.configurable) {
    withTemporaryProperty(globalThis, 'window', null, () => {
      assert.throws(read, TypeError);
    });
  }
  withTemporaryProperty(globalThis, 'window', globalThis, () => {
    withTemporaryProperty(globalThis, 'self', globalThis, () => {
      withTemporaryProperty(Array, 'of', undefined, () => {
        assert.deepEqual(read(), [[7], 1]);
      });
    });
  });
});

QUnit.test('destructuring: a partial instance mirror shares its captured receiver', assert => {
  const key = 'mirrorPeer';
  let held;
  const atDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  const peerDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, key);
  try {
    /* eslint-disable no-extend-native, unicorn/prefer-object-define-properties -- compare getter receivers, restore both descriptors below */
    Object.defineProperty(Array.prototype, 'at', { configurable: true, get() {
      held = this;
      return function () { return 11; };
    } });
    Object.defineProperty(Array.prototype, key, { configurable: true, get() {
      return held === this;
    } });
    /* eslint-enable no-extend-native, unicorn/prefer-object-define-properties -- temporary descriptors are installed */
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- read the temporary receiver identity probe
    function read({ at, [key]: same } = [7]) {
      return [at(), same];
    }
    assert.deepEqual(read(), [11, true]);
  } finally {
    restoreProperty(Array.prototype, 'at', atDescriptor);
    restoreProperty(Array.prototype, key, peerDescriptor);
  }
});
