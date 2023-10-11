import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Function#@@hasInstance', assert => {
  assert.true(Symbol.hasInstance in Function.prototype);
  assert.true(Function[Symbol.hasInstance](() => { /* empty */ }));
  assert.false(Function[Symbol.hasInstance]({}));
});
