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
    const [{ sign } = {}] = held;
    assert.deepEqual(events, ['read']);
    assert.same(sign(-4), -1);
    function make() {
      events.push('call');
      return [Math];
    }
    const [{ sign: direct } = {}] = make();
    // eslint-disable-next-line no-unsafe-optional-chaining -- the proven callee tests the optional spelling
    const [{ sign: optional } = {}] = make?.();
    assert.same(direct(-4), -1);
    assert.same(optional(4), 1);
    assert.deepEqual(events, ['read', 'call', 'read', 'call', 'read']);
    let assigned;
    let beside;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    [{ sign: assigned }, beside] = make();
    assert.same(assigned(-4), -1);
    assert.same(beside, undefined);
    // eslint-disable-next-line no-unsafe-optional-chaining -- the proven callee tests the optional spelling
    const [{ sign: plainOptional }] = make?.();
    assert.same(plainOptional(4), 1);
    assert.deepEqual(events, ['read', 'call', 'read', 'call', 'read', 'call', 'read', 'call', 'read']);
    const holder = { k: [Math] };
    const { k: [{ sign: nested }, tail] } = holder;
    assert.same(nested(-4), -1);
    assert.same(tail, undefined);
    assert.same(events.length, 10);
  } finally {
    restoreProperty(Math, 'sign', descriptor);
  }
});
