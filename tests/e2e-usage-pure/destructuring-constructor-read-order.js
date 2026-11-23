/* eslint-disable no-var, no-redeclare, block-scoped-var -- var exposes binding order even after ES5 lowering */
import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('destructuring: an instance read on a constructor stays between native siblings', assert => {
  var name;
  const events = [];
  const includesDescriptor = Object.getOwnPropertyDescriptor(Array, 'includes');
  const toStringDescriptor = Object.getOwnPropertyDescriptor(Array, 'toString');
  // Foreign installation keeps the read under test visible to the transform's census.
  restoreProperty(Array, 'includes', {
    configurable: true,
    get() {
      events.push(typeof name);
      return 17;
    },
  });
  restoreProperty(Array, 'toString', {
    configurable: true,
    get() {
      events.push(typeof name);
      return 23;
    },
  });
  try {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- the foreign getter is a native residual
    var { includes, name, toString } = Array;
    assert.deepEqual([includes, typeof name, toString], [17, 'string', 23]);
    assert.deepEqual(events, ['undefined', 'string'], 'the name binding is written between the two getters');
  } finally {
    restoreProperty(Array, 'includes', includesDescriptor);
    restoreProperty(Array, 'toString', toStringDescriptor);
  }
});

QUnit.test('destructuring: a native getter sees the preceding static assignment', assert => {
  const array = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(array, 'orderProbe');
  let make, observed;
  restoreProperty(array, 'orderProbe', { configurable: true, get() { return typeof make; } });
  try {
    function realm() { return globalThis; }

    ({ Array: { of: make, orderProbe: observed } } = realm());
    assert.same(observed, 'function');
    assert.deepEqual(make(3), [3]);
  } finally {
    restoreProperty(array, 'orderProbe', previous);
  }
});

QUnit.test('destructuring: a later argument runs before a parameter getter', assert => {
  function read(flag, user, after) {
    // eslint-disable-next-line sonarjs/no-extra-arguments -- the later argument runs before parameter initialization
    return (({ entries }) => entries)(flag ? Object : user, after());
  }
  let visits = 0;
  const user = { get entries() { return visits; } };
  assert.same(read(false, user, () => ++visits), 1);
  assert.deepEqual(read(true, user, () => ++visits)({ a: 3 }), [['a', 3]]);
  assert.same(visits, 2);
});
