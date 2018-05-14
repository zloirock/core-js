import sub from 'core-js-pure/features/string/sub';

QUnit.test('String#sub', assert => {
  assert.isFunction(sub);
  assert.same(sub('a'), '<sub>a</sub>', 'lower case');
});
