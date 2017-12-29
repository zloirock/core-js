import small from '../../ponyfill/fn/string/small';

QUnit.test('String#small', assert => {
  assert.isFunction(small);
  assert.same(small('a'), '<small>a</small>', 'lower case');
});
