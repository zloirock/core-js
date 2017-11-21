import { GLOBAL } from '../helpers/constants';

QUnit.test('forEach method on iterable DOM collections', assert => {
  let absent = true;
  const collections = [
    'NodeList',
    'DOMTokenList'
  ];

  for (const name of collections) {
    const Collection = GLOBAL[name];
    if (Collection) {
      absent = false;
      assert.isFunction(Collection.prototype.forEach, `${ name }::forEach is a function`);
      assert.same(Collection.prototype.forEach, Array.prototype.forEach, `${ name }::forEach is equal of Array::forEach`);
    }
  }

  if (absent) {
    assert.ok(true, 'DOM collections are absent');
  }
});
