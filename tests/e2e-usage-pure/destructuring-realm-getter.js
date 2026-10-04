import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: a prefixed realm getter is shared by nested instance extractions', assert => {
  const events = [];
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Array');
  const A = Array;
  Object.defineProperty(globalThis, 'Array', {
    configurable: true,
    get() {
      events.push('Array');
      return A;
    },
  });
  try {
    const { prototype: { at, values } } = (events.push('prefix'), globalThis.Array);
    assert.same(at.call([3, 4], -1), 4);
    assert.same(values.call([5]).next().value, 5);
    assert.deepEqual(events, ['prefix', 'Array']);
  } finally {
    restoreProperty(globalThis, 'Array', original);
  }
});

QUnit.test('destructuring: a quiet prefixed realm surface still serves every nested instance', assert => {
  const events = [];
  const { prototype: { at, values } } = (events.push('prefix'), globalThis.Array);
  assert.same(at.call([3, 4], -1), 4);
  assert.same(values.call([5]).next().value, 5);
  assert.deepEqual(events, ['prefix']);
});
