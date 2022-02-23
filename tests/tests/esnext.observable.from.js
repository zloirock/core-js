QUnit.test('Observable.from', assert => {
  assert.isFunction(Observable.from);
  assert.arity(Observable.from, 1);
  assert.name(Observable.from, 'from');
  assert.looksNative(Observable.from);
});
