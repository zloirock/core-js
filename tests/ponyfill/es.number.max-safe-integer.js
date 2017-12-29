import MAX_SAFE_INTEGER from '../../ponyfill/fn/number/max-safe-integer';

QUnit.test('Number.MAX_SAFE_INTEGER', assert => {
  assert.strictEqual(MAX_SAFE_INTEGER, 2 ** 53 - 1, 'Is 2^53 - 1');
});
