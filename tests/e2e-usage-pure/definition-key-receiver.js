QUnit.test('definition keys: an invoked receiver retains its static methods', assert => {
  function objectKey() {
    return Object.keys({ [typeof this.groupBy]() { /* empty */ } })[0];
  }
  function classKey() {
    return Object.keys(new class { [typeof this.groupBy] = 1; }())[0];
  }
  assert.same(objectKey.call(Map), 'function');
  assert.same(Reflect.apply(classKey, Map, []), 'function');
});
