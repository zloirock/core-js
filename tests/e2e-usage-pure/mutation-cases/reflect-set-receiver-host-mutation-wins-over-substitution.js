import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('mutated-statics: Reflect.set receiver-host mutation wins over substitution', assert => {
  function patched() { return 'receiver-win'; }
  const originalDescriptor = Object.getOwnPropertyDescriptor(Promise, 'reject');

  Reflect.set({}, 'reject', patched, Promise);
  try {
    assert.same(Promise.reject('x'), 'receiver-win');
  } finally {
    restoreProperty(Promise, 'reject', originalDescriptor);
  }
});
