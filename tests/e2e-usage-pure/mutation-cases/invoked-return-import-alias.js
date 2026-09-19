import { restoreProperty } from '../../helpers/restore-property.cjs';
import invoke from '@core-js/pure/actual/reflect/apply';

const alias = invoke;

QUnit.test('mutation channel: invoked-return-import-alias', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array, 'from');
  function patched() { return 'patched'; }
  try {
    function pick(value) { return { value }; }
    alias(pick, null, [Array]).value.from = patched;
    assert.same(Array.from([1]), 'patched');
  } finally {
    restoreProperty(Array, 'from', descriptor);
  }
});
