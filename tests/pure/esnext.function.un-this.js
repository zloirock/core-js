import unThis from 'core-js-pure/features/function/un-this';

QUnit.test('Function#unThis', assert => {
  assert.isFunction(unThis);
  // eslint-disable-next-line prefer-arrow-callback -- required for testing
  assert.same(unThis(function () { return 42; })(), 42);
  assert.deepEqual(unThis(Array.prototype.slice)([1, 2, 3], 1), [2, 3]);
});
