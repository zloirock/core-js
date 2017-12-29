import MIN_SAFE_INTEGER from '../../ponyfill/fn/number/min-safe-integer';

QUnit.test('Number.MIN_SAFE_INTEGER', assert => {
  assert.strictEqual(MIN_SAFE_INTEGER, -(2 ** 53) + 1, 'Is -2^53 + 1');
});
