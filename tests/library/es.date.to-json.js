QUnit.test('Date#toJSON', function (assert) {
  var toJSON = core.Date.toJSON;
  var toISOString = core.Date.toISOString;
  assert.isFunction(toJSON);
  if (Date.prototype.toISOString) {
    var date = new Date();
    assert.same(toJSON(date), toISOString(date), 'base');
  }
  assert.same(toJSON(new Date(NaN)), null, 'not finite');
  assert.same(toJSON({
    toISOString: function () {
      return 42;
    }
  }), 42, 'generic');
});
