QUnit.test('Date#toGMTString', assert => {
  const { toGMTString } = Date.prototype;
  assert.isFunction(toGMTString);
  assert.arity(toGMTString, 0);
  // assert.name(toGMTString, 'toUTCString'); // at least old WebKit
  assert.looksNative(toGMTString);
  assert.nonEnumerable(Date.prototype, 'toGMTString');
  // assert.same(toGMTString, Date.prototype.toUTCString); // at least old WebKit
  const date = new Date();
  assert.same(date.toGMTString(), date.toUTCString());
});
