import small from '../../packages/core-js-pure/fn/string/small';

QUnit.test('String#small', assert => {
  assert.isFunction(small);
  assert.same(small('a'), '<small>a</small>', 'lower case');
});
