import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: a static alias preserves its native property read', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Math, 'sign');
  const events = [];
  // The foreign helper models an external getter without deoptimizing the static claim.
  restoreProperty(Math, 'sign', {
    configurable: true,
    get() {
      events.push('read');
      return descriptor && descriptor.value;
    },
  });
  try {
    const held = [Math];
    // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
    const [{ sign } = {}] = held;
    assert.deepEqual(events, ['read']);
    function make() {
      events.push('call');
      return [Math];
    }
    // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
    const [{ sign: direct } = {}] = make();
    // eslint-disable-next-line no-unsafe-optional-chaining, no-unused-vars -- the proven callee tests the optional spelling
    const [{ sign: optional } = {}] = make?.();
    assert.deepEqual(events, ['read', 'call', 'read', 'call', 'read']);
    let assigned;
    let beside;
    // eslint-disable-next-line prefer-const, no-unused-vars -- the assignment pattern is the tested host
    [{ sign: assigned }, beside] = make();
    assert.same(beside, undefined);
    // eslint-disable-next-line no-unsafe-optional-chaining, no-unused-vars -- the proven callee tests the optional spelling
    const [{ sign: plainOptional }] = make?.();
    assert.deepEqual(events, ['read', 'call', 'read', 'call', 'read', 'call', 'read', 'call', 'read']);
    const holder = { k: [Math] };
    // eslint-disable-next-line no-unused-vars -- retain static slots without requiring wrapper polyfills
    const { k: [{ sign: nested }, tail] } = holder;
    assert.same(tail, undefined);
    assert.same(events.length, 10);
  } finally {
    restoreProperty(Math, 'sign', descriptor);
  }
});
