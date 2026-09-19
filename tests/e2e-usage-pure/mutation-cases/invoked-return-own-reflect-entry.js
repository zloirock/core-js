import { restoreProperty } from '../../helpers/restore-property.cjs';
import invoke from '@core-js/pure/actual/reflect/apply';

QUnit.test('mutation channel: invoked-return-own-reflect-entry', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  try {
    function pick(value) { return { value }; }
    invoke(pick, null, [Array]).value.from = patched;
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
