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
