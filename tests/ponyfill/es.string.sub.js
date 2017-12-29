import sub from '../../ponyfill/fn/string/sub';

QUnit.test('String#sub', assert => {
  assert.isFunction(sub);
  assert.same(sub('a'), '<sub>a</sub>', 'lower case');
});
