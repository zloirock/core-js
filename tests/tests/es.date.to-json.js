QUnit.test('Date#toJSON', assert => {
  const { toJSON } = Date.prototype;
  assert.isFunction(toJSON);
  assert.arity(toJSON, 1);
  assert.name(toJSON, 'toJSON');
  assert.looksNative(toJSON);
  assert.nonEnumerable(Date.prototype, 'toJSON');
  const date = new Date();
  assert.same(date.toJSON(), date.toISOString(), 'base');
  assert.same(new Date(NaN).toJSON(), null, 'not finite');
  assert.same(toJSON.call({
    toISOString() {
      return 42;
    },
  }), 42, 'generic');
});
