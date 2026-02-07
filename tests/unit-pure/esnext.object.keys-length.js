import keysLength from '@core-js/pure/full/object/keys-length';

QUnit.test('Object.keysLength', assert => {
  assert.isFunction(keysLength);
  assert.name(keysLength, 'keysLength');
  assert.arity(keysLength, 1);

  assert.same(keysLength({ a: 1, b: 2 }), 2, 'Basic functionality');
  assert.same(keysLength({}), 0, 'Empty object');
  assert.throws(() => keysLength(null), TypeError);
  assert.throws(() => keysLength(), TypeError);
});
