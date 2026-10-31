import { withWindowPresence } from './unbacked-window-host.cjs';

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
