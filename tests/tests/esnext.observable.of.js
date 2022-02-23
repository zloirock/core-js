QUnit.test('Observable.of', assert => {
  assert.isFunction(Observable.of);
  assert.arity(Observable.of, 0);
  assert.name(Observable.of, 'of');
  assert.looksNative(Observable.of);
});
