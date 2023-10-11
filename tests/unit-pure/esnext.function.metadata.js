import Symbol from '@core-js/pure/actual/symbol';

QUnit.test('Function#@@metadata', assert => {
  assert.true(Symbol.metadata in Function.prototype);
  assert.same(Function.prototype[Symbol.metadata], null, 'is null');
});
