import { restoreProperty } from '../../helpers/restore-property.cjs';

// a static the module replaces is no longer the one the registry describes: the replacement writes the
// holder it is handed, so a field read after the call must not keep the narrow the built-in allowed
QUnit.test('mutated-statics: a replaced static may write the holder it is handed', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Object, 'keys');
  const holder = { data: [10, 20] };
  try {
    Object.keys = function (value) {
      value.data = '1020';
      return [];
    };
    Object.keys(holder);
  } finally {
    restoreProperty(Object, 'keys', descriptor);
  }
  assert.true(holder.data.includes('02'));
});
