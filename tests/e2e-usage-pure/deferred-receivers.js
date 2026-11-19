import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('nested claims survive a copied callback receiver', assert => {
  const seen = [];
  function source(callback) {
    callback();
    return [1, 2];
  }
  const { at } = source(() => {
    const { includes } = source(() => {
      const { flat } = [[1], [2]];
      seen.push(flat.call([[1], [2]]).length);
    });
    seen.push(includes.call([1], 1));
  });
  assert.same(at.call([1, 2], -1), 2);
  assert.deepEqual(seen, [2, true]);
});

QUnit.test('nested synths settle before an outer partial synth', assert => {
  let seen;
  function source(callback) {
    callback();
    return Array;
  }
  const result = (({ of, isArray }) => [typeof of, typeof isArray])(source(() => {
    function inner({ from } = Array) { return from([7])[0]; }
    seen = inner();
  }));
  assert.same(seen, 7);
  assert.deepEqual(result, ['function', 'function']);
});

QUnit.test('retained receiver probes keep prefix claims once', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const effects = [];
    function prefix() {
      effects.push([7].at(0));
    }
    let result;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the seal must throw before the fallback
      const { resolve } = ((prefix(), globalThis.window)?.self).Promise ?? {};
      result = typeof resolve;
    } catch (error) {
      result = error.name;
    }
    assert.same(result, live ? 'function' : 'TypeError');
    assert.deepEqual(effects, [7]);
  });
});

QUnit.test('a lifted prefix precedes a quiet consumed getter', assert => {
  const effects = [];
  const holder = { get box() {
    effects.push('box');
    return { A: Array };
  } };
  const { A: { from } } = (effects.push('prefix'), holder.box);
  assert.same(typeof from, 'function');
  assert.deepEqual(effects, ['prefix', 'box']);
});
