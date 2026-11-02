import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('alias residual reads the constructor in declarations and for-init', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const realm = globalThis.window;
    const effects = [];
    const results = [];
    try {
      const { Map: { prototype: proto = (effects.push('default'), {}) } } = realm.self;
      results.push(typeof proto.get);
    } catch (error) {
      results.push(error instanceof TypeError);
    }
    try {
      // eslint-disable-next-line no-unreachable-loop -- Exercise the for-init extraction channel once.
      for (const { Map: { prototype: proto = (effects.push('default'), {}) } } = realm.self; ;) {
        results.push(typeof proto.get);
        break;
      }
    } catch (error) {
      results.push(error instanceof TypeError);
    }
    assert.deepEqual(results, live ? ['function', 'function'] : [true, true]);
    assert.deepEqual(effects, []);
  });
});

QUnit.test('stored alias residual keeps one write and its source read', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    const results = [];
    let held;
    try {
      const { Map: { prototype: proto = (effects.push('default'), {}) } } = (effects.push('declaration'), (held = globalThis.window).self);
      results.push(typeof proto.get);
    } catch (error) {
      results.push(error instanceof TypeError);
    }
    assert.same(held, live ? globalThis : undefined);
    held = 'unset';
    try {
      // eslint-disable-next-line no-unreachable-loop -- Exercise the for-init extraction channel once.
      for (const { Map: { prototype: proto = (effects.push('default'), {}) } } = (effects.push('for'), (held = globalThis.window).self); ;) {
        results.push(typeof proto.get);
        break;
      }
    } catch (error) {
      results.push(error instanceof TypeError);
    }
    assert.same(held, live ? globalThis : undefined);
    // Detecting after lowering sees a plain member chain, whose realm hops collapse.
    // Source-pattern detection instead retains the stored receiver's throwing read.
    const collapsed = live || typeof E2E_DETECT_LOWERED !== 'undefined';
    assert.deepEqual(results, collapsed ? ['function', 'function'] : [true, true]);
    assert.deepEqual(effects, ['declaration', 'for']);
  });
});

QUnit.test('live residual anchor keeps the stored receiver and its prefix', assert => {
  const effects = [];
  let held;
  const { Map: { missing } } = held = (effects.push('prefix'), globalThis);
  assert.same(missing, undefined);
  assert.same(held, globalThis);
  assert.deepEqual(effects, ['prefix']);
});

QUnit.test('live residual anchor preserves guarded throws before defaults', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    let thrown = false;
    let result;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- The residual must retain this TypeError before the default.
      const { Map: { missing = (effects.push('default'), 'ab'.at(-1)) } } = (effects.push('prefix'), globalThis.window?.self);
      result = missing;
    } catch (error) {
      thrown = error instanceof TypeError;
    }
    assert.same(thrown, !live);
    assert.same(result, live ? 'b' : undefined);
    assert.deepEqual(effects, live ? ['prefix', 'default'] : ['prefix']);
  });
});

QUnit.test('stored residual receiver keeps its guarded value', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    let held;
    let thrown = false;
    let result;
    try {
      const { Map: { missing = (effects.push('default'), 'ab'.at(-1)) } } = held = (effects.push('prefix'), globalThis.window?.self);
      result = missing;
    } catch (error) {
      thrown = error instanceof TypeError;
    }
    assert.same(thrown, !live);
    assert.same(held, live ? globalThis : undefined);
    assert.same(result, live ? 'b' : undefined);
    assert.deepEqual(effects, live ? ['prefix', 'default'] : ['prefix']);
  });
});

QUnit.test('stored mirror receiver rejects null before static extraction', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    let held;
    let thrown = false;
    let result;
    try {
      const { Map: { groupBy, missing = (effects.push('default'), 'ok') } } = held = (effects.push('prefix'), globalThis.window?.self);
      result = [groupBy([1], value => value).get(1)[0], missing];
    } catch (error) {
      thrown = error instanceof TypeError;
    }
    assert.same(thrown, !live);
    assert.same(held, live ? globalThis : undefined);
    assert.deepEqual(result, live ? [1, 'ok'] : undefined);
    assert.deepEqual(effects, live ? ['prefix', 'default'] : ['prefix']);
  });
});
