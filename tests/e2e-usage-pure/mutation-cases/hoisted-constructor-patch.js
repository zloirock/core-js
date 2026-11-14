import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('a patch through a hoisted constructor write reaches the same constructor', assert => {
  let M = null;
  initialize();
  const saved = Object.getOwnPropertyDescriptor(M, 'groupBy');
  try {
    M.groupBy = () => 17;
    assert.same(Map.groupBy([]), 17);
  } finally {
    restoreProperty(M, 'groupBy', saved);
  }
  function initialize() { M = Map; }
});
