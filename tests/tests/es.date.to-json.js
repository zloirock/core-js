QUnit.test('Date#toJSON', function (assert) {
  var toJSON = Date.prototype.toJSON;
  assert.isFunction(toJSON);
  assert.arity(toJSON, 1);
  assert.name(toJSON, 'toJSON');
  assert.looksNative(toJSON);
  assert.nonEnumerable(Date.prototype, 'toJSON');
  var date = new Date();
  assert.same(date.toJSON(), date.toISOString(), 'base');
  assert.same(new Date(NaN).toJSON(), null, 'not finite');
  assert.same(toJSON.call({
    toISOString: function () {
      return 42;
    }
  }), 42, 'generic');
});
