import { withRealmSelf } from './window-without-self-host.js';

QUnit.test('synth activation: full coverage rescues the receiver once', assert => {
  const effects = [];
  function read(choose) {
    const { from, of } = choose ? (() => {
      effects.push('receiver');
      return Array;
    })() : Array;
    effects.push('body');
    return [from([1]), of(2)];
  }
  assert.deepEqual(read(true), [[1], [2]]);
  assert.deepEqual(effects, ['receiver', 'body']);
  effects.length = 0;
  assert.deepEqual(read(false), [[1], [2]]);
  assert.deepEqual(effects, ['body'], 'the other branch bypasses the call');
});

QUnit.test('synth activation: partial coverage preserves receiver, key and default order', assert => {
  const effects = [];
  function read(choose) {
    const { [(effects.push('key'), 'from')]: from, missing = (effects.push('default'), 7) } = choose
      ? (() => { effects.push([1].at(0) ? 'receiver' : 'wrong'); return Array; })() : Array;
    effects.push('body');
    return [from([3]), missing];
  }
  assert.deepEqual(read(true), [[3], 7]);
  assert.deepEqual(effects, ['receiver', 'key', 'default', 'body']);
  effects.length = 0;
  assert.deepEqual(read(true), [[3], 7]);
  assert.deepEqual(effects, ['receiver', 'key', 'default', 'body'], 'each activation owns its memo');
});

QUnit.test('synth activation: a member prefix runs only once', assert => {
  const effects = [];
  // eslint-disable-next-line es/no-nonstandard-array-properties -- An unavailable slot exercises partial coverage.
  const result = (({ from, missing = (effects.push('default'), 8) } = (effects.push('get'), globalThis).Array) => [from([4]), missing])();
  assert.deepEqual(result, [[4], 8]);
  assert.deepEqual(effects, ['get', 'default']);
});

QUnit.test('synth activation: only the selected branch runs', assert => {
  const effects = [];
  function read(choose) {
    return (({ from, missing = 9 } = choose ? (() => {
      effects.push('left');
      return Array;
    })() : Array) => [from([5]), missing])();
  }
  assert.deepEqual(read(false), [[5], 9]);
  assert.deepEqual(effects, []);
  assert.deepEqual(read(true), [[5], 9]);
  assert.deepEqual(effects, ['left']);
});

QUnit.test('synth activation: the fallback stays outside the optional receiver', assert => {
  const effects = [];
  function read({ from, missing = (effects.push('default'), 10) } = globalThis.window?.Array || (effects.push('fallback'), Array)) {
    return [from([6]), missing];
  }
  assert.deepEqual(read(), [[6], 10]);
  assert.deepEqual(effects, typeof window === 'undefined' ? ['fallback', 'default'] : ['default']);
});

QUnit.test('synth activation: discarded navigation retains rewritten effects', assert => {
  withRealmSelf(() => {
    const effects = [];
    function read(choose) {
      // eslint-disable-next-line @stylistic/no-extra-parens -- Keep the explicit receiver wrapper through deferred insertion.
      const { of } = choose ? ((effects.push(Array.from([1])), globalThis.self).Array) : Array;
      return of(2);
    }
    assert.deepEqual(read(true), [2]);
    assert.deepEqual(effects, [[1]], 'the selected rescue and its nested static run once');
    effects.length = 0;
    assert.deepEqual(read(false), [2]);
    assert.deepEqual(effects, [], 'the other branch does not replay the rescue');
    // eslint-disable-next-line @stylistic/no-extra-parens -- The sequence is nested under a separate navigation wrapper.
    function parameter({ from } = ((effects.push(Array.of(3)), globalThis).self).Array) {
      return from([4]);
    }
    assert.deepEqual(parameter(), [4]);
    assert.deepEqual(effects, [[3]], 'the default retains its own effect before binding');
  });
});
