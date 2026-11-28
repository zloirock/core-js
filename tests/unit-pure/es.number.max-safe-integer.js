import MAX_SAFE_INTEGER from '@core-js/pure/es/number/max-safe-integer';
import Number from '@core-js/pure/es/number';

QUnit.test('Number.MAX_SAFE_INTEGER', assert => {
  assert.same(MAX_SAFE_INTEGER, 2 ** 53 - 1, 'Is 2^53 - 1');
  assert.same(Number.MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
  assert.nonEnumerable(Number, 'MAX_SAFE_INTEGER');
  assert.nonConfigurable(Number, 'MAX_SAFE_INTEGER');
  assert.nonWritable(Number, 'MAX_SAFE_INTEGER');
});
