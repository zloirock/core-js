import MAX_SAFE_INTEGER from '@core-js/pure/es/number/max-safe-integer';

QUnit.test('Number.MAX_SAFE_INTEGER', assert => {
  assert.same(MAX_SAFE_INTEGER, 2 ** 53 - 1, 'Is 2^53 - 1');
});
