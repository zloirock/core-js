import fixed from 'core-js-pure/full/string/fixed';

QUnit.test('String#fixed', assert => {
  assert.isFunction(fixed);
  assert.same(fixed('a'), '<tt>a</tt>', 'lower case');
});
