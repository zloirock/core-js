import demethodize from '@core-js/pure/full/function/demethodize';

QUnit.test('Function#demethodize', assert => {
  assert.isFunction(demethodize);
  // eslint-disable-next-line prefer-arrow-callback -- required for testing
  assert.same(demethodize(function () { return 42; })(), 42);
  assert.deepEqual(demethodize(Array.prototype.slice)([1, 2, 3], 1), [2, 3]);
});
