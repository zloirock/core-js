import { restoreProperty } from '../helpers/restore-property.cjs';

function loggedGetter(events, name, value) {
  return {
    configurable: true,
    get() {
      events.push(name);
      return value;
    },
  };
}

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

QUnit.test('static capture preserves each getter beside a computed key', assert => {
  const events = [];
  const savedFrom = Object.getOwnPropertyDescriptor(Array, 'from');
  const savedOf = Object.getOwnPropertyDescriptor(Array, 'of');
  restoreProperty(Array, 'from', loggedGetter(events, 'from', savedFrom?.value));
  restoreProperty(Array, 'of', loggedGetter(events, 'of', savedOf?.value));
  function read(key) {
    const { Array: { from, [(events.push('key'), 'of')]: of, [key]: value } } = globalThis;
    return [from([4])[0], of(9)[0], value];
  }
  try {
    assert.deepEqual(read('length'), [4, 9, 1]);
    assert.deepEqual(events, ['from', 'key', 'of']);
  } finally {
    restoreProperty(Array, 'from', savedFrom);
    restoreProperty(Array, 'of', savedOf);
  }
});

QUnit.test('a nested instance default stays between native constructor getters', assert => {
  const events = [];
  const savedAt = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  const savedLeft = Object.getOwnPropertyDescriptor(Array, 'w29Left');
  const savedRight = Object.getOwnPropertyDescriptor(Array, 'w29Right');
  restoreProperty(Array, 'w29Left', loggedGetter(events, 'left', 1));
  restoreProperty(Array.prototype, 'at', loggedGetter(events, 'at', 7));
  restoreProperty(Array, 'w29Right', loggedGetter(events, 'right', 2));
  try {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- foreign getters bracket the prototype read
    const { w29Left, prototype: { at = events.push('default') }, w29Right } = Array;
    assert.deepEqual([w29Left, at.call([3, 7], -1), w29Right], [1, 7, 2]);
    assert.deepEqual(events, ['left', 'at', 'right']);
    function read(source) {
      const { first, nested: { at: own = events.push('default') }, last } = source;
      return [first, own, last];
    }
    assert.deepEqual(read({ first: 1, nested: { get at() { return 7; } }, last: 2 }), [1, 7, 2]);
  } finally {
    restoreProperty(Array, 'w29Left', savedLeft);
    restoreProperty(Array.prototype, 'at', savedAt);
    restoreProperty(Array, 'w29Right', savedRight);
  }
});
