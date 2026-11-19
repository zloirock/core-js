import array from '../transpiler-fixtures/usage-pure/pure-import-sources/foreign/features/array.mjs';
import getList from '../transpiler-fixtures/usage-pure/pure-import-sources/foreign/features/list.mjs';

QUnit.test('foreign import paths do not claim pure provenance', assert => {
  assert.deepEqual(array.from([7]), ['foreign', 7]);
  assert.same(getList().at(-1), 9);
  function read(items = getList()) {
    return items.at(-1);
  }
  assert.same(read(), 9);
  assert.same(read([11]), 11);
});
