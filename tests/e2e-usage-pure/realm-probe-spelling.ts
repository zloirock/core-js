import { withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('a deferred probe survives a replaced typed root', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    let result;
    try {
      result = (({ entries, other }) => [typeof entries, typeof other])((globalThis as any).window?.self.Object);
    } catch (error) {
      result = error.name;
    }
    assert.deepEqual(result, live ? ['function', 'undefined'] : 'TypeError');
  });
});

QUnit.test('computed realm probes stop before a missing native constructor', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const key = 'Promise';
    let result;
    try {
      const w = globalThis.window;
      result = typeof w[key].resolve;
    } catch (error) {
      result = error.name;
    }
    assert.same(result, live ? 'function' : 'TypeError');
  });
});

QUnit.test('native realm leaves do not capture local constructor names', assert => {
  for (const present of [false, true]) withWindowPresence(present, live => {
    const events = [];
    function read(Array?: unknown) {
      // eslint-disable-next-line no-unsafe-optional-chaining -- an absent receiver must throw
      const { from } = (events.push('prefix'), globalThis.window)?.Array;
      return [from([3])[0], Array];
    }
    let result;
    try { result = read(); } catch (error) { result = error.name; }
    assert.deepEqual(result, live ? [3, undefined] : 'TypeError');
    assert.deepEqual(events, ['prefix']);
  });
});

QUnit.test('minted mirror keys preserve line and paragraph separators', assert => {
  const { Array: { from, 'x\u2028y': line, 'x\u2029y': paragraph } } = globalThis;
  assert.deepEqual(from([3]), [3]);
  assert.same(line, undefined);
  assert.same(paragraph, undefined);
});
