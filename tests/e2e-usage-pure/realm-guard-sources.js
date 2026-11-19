import { withWindowPresence } from './unbacked-window-host.cjs';
import { withGlobalPresence } from './unbacked-global-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('a constructor fallback evaluates the full prefix before testing the receiver', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const events = [];
    const realm = globalThis.window;
    function read() {
      // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- This absent binding must throw between the two calls.
      return (events.push('first'), missingRealmPrefix, events.push('last'), realm)?.self.WeakMap.mode;
    }
    assert.throws(read, ReferenceError);
    assert.deepEqual(events, ['first']);
    // eslint-disable-next-line @stylistic/no-extra-parens -- Keep the effect and the static key in one computed sequence.
    const method = (events.push('prefix'), realm)?.self[(events.push('key'), 'WeakMap')].hasOwnProperty;
    assert.same(typeof method, present ? 'function' : 'undefined');
    assert.deepEqual(events, present ? ['first', 'prefix', 'key'] : ['first', 'prefix']);
    const nested = [];
    assert.throws(() => {
      // eslint-disable-next-line no-undef -- The inner guard cannot skip the outer read.
      return (nested.push('before'), missingRealmPrefix, nested.push('after'), realm?.self)?.WeakMap.mode;
    }, ReferenceError);
    assert.deepEqual(nested, ['before']);
  });
});

QUnit.test('realm guards: a missing intermediate hop throws before the store', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    let held = 'unset';
    function read() { return (held = globalThis.window.window?.Array)?.isArray; }
    if (present) {
      assert.true(read()([]));
      assert.same(held, Array);
    } else {
      assert.throws(read, TypeError);
      assert.same(held, 'unset');
    }
  });
});

QUnit.test('realm guards: a call keeps its absence and the live leaf effects', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    function get() {
      effects.push('call');
      return globalThis.window;
    }
    // eslint-disable-next-line @stylistic/no-extra-parens -- Keep the computed sequence spelling under test.
    const result = get()?.Array?.[(effects.push('key'), 'from')]((effects.push('argument'), [3]));
    assert.deepEqual(result, present ? [3] : undefined);
    assert.deepEqual(effects, present ? ['call', 'key', 'argument'] : ['call']);
  });
});

QUnit.test('realm guards: a stored call result retains the observed value', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    function get() { return globalThis.window; }
    let held;
    const result = (held = get())?.Object?.hasOwn({ x: 1 }, 'x');
    assert.same(result, present ? true : undefined);
    assert.same(held, globalThis.window);
  });
});

QUnit.test('realm guards: a selection and its copied alias keep the environment probe', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    for (const choice of [false, true]) {
      const effects = [];
      const root = globalThis;
      // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- Distinct realm aliases are the input under test.
      const selected = choice ? root : self;
      const copied = selected;
      const first = copied.window?.Array.from([3]);
      // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- Preserve both realm-alias arms.
      const second = ((effects.push('test'), choice) ? globalThis : self).window?.Array.of(4);
      assert.deepEqual(first, present ? [3] : undefined);
      assert.deepEqual(second, present ? [4] : undefined);
      assert.deepEqual(effects, ['test']);
    }
  });
});

QUnit.test('realm guards: independent environment probes do not test the native constructor', assert => {
  for (const windowRequested of [false, true]) withWindowPresence(windowRequested, windowPresent => {
    for (const globalRequested of [false, true]) withGlobalPresence(globalRequested, globalPresent => {
      const from = globalThis.window?.global?.Iterator?.from;
      if (windowPresent && globalPresent) assert.same(from([3]).next().value, 3);
      else assert.same(from, undefined);
    });
  });
});

QUnit.test('realm guards: a sealed backed hop keeps the original probe', assert => {
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    // eslint-disable-next-line @stylistic/no-extra-parens -- The sealed optional form is the input under test.
    const from = (globalThis.window?.self)?.Iterator?.from;
    if (present) assert.same(from([3]).next().value, 3);
    else assert.same(from, undefined);
  });
});

QUnit.test('realm guards: a returned user property keeps its own receiver', assert => {
  const effects = [];
  const user = { self: { Array: {
    from() {
      effects.push('from');
      return 31;
    },
  } }, window: { value: 41 } };
  withTemporaryProperty(globalThis, 'lib', user, () => {
    function get() { return globalThis.lib; }
    assert.same(get().self.Array.from([3]), 31);
    assert.same(get().window.value, 41);
    assert.deepEqual(effects, ['from']);
  });
});
