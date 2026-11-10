import { withWindowWithoutSelf } from './window-without-self-host.js';

QUnit.test('a stored optional receiver selects once before destructuring', assert => {
  withWindowWithoutSelf(() => {
    const effects = [];
    let held;
    const { resolve } = (held = (effects.push('store'), globalThis.window))?.Promise || (effects.push('fallback'), {});
    assert.isFunction(resolve);
    assert.same(held, globalThis);
    assert.deepEqual(effects, ['store']);
  });
});

QUnit.test('a kept parameter receiver preserves the supplied argument', assert => {
  withWindowWithoutSelf(() => {
    const effects = [];
    let held;
    // eslint-disable-next-line no-unsafe-optional-chaining -- the default's native throw is the tested boundary
    function read({ resolve } = (held = (effects.push('store'), globalThis.window))?.self.Promise) {
      return resolve;
    }
    assert.isFunction(read());
    assert.same(read({ resolve: 7 }), 7);
    assert.same(held, globalThis);
    assert.deepEqual(effects, ['store']);
  });
});

QUnit.test('sealed optional receivers retain sequence effects before their method', assert => {
  withWindowWithoutSelf(() => {
    const effects = [];
    let held;
    // eslint-disable-next-line no-unsafe-optional-chaining -- the plain read through the seal is intentional
    const method = (effects.push('prefix'), ((held = globalThis.window)?.self).self)?.Array.prototype.at;
    assert.same(method.call([3, 5], -1), 5);
    assert.same(held, globalThis);
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('nested static mirrors consume the method key after a sealed realm read', assert => {
  withWindowWithoutSelf(() => {
    const effects = [];
    // eslint-disable-next-line no-unsafe-optional-chaining -- the plain read through the seal is intentional
    const { [(effects.push('key'), 'groupBy')]: { length } } = (effects.push('source'), (globalThis.window?.self).self.Map);
    assert.same(length, 2);
    assert.deepEqual(effects, ['source', 'key']);
  });
});
