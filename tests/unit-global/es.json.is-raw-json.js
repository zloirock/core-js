QUnit.test('JSON.rawJSON', assert => {
  const { isRawJSON, rawJSON } = JSON;
  const { freeze } = Object;

  assert.isFunction(isRawJSON);
  assert.arity(isRawJSON, 1);
  assert.name(isRawJSON, 'isRawJSON');
  assert.looksNative(isRawJSON);

  assert.true(isRawJSON(rawJSON(1)), 'raw1');
  assert.true(isRawJSON(rawJSON(null)), 'raw2');
  assert.false(isRawJSON(freeze({ rawJSON: '123' })), 'fake');
  assert.false(isRawJSON(undefined), 'undefined');
  assert.false(isRawJSON(null), 'null');
  assert.false(isRawJSON(1), 'number');
  assert.false(isRawJSON('qwe'), 'string');
  assert.false(isRawJSON(true), 'bool');
  assert.false(isRawJSON(Symbol('JSON.isRawJSON test')), 'sym');
  assert.false(isRawJSON({}), 'object');
  assert.false(isRawJSON([]), 'array');
});
