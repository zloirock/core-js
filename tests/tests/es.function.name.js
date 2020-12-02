QUnit.test('Function#name', assert => {
  assert.ok('name' in Function.prototype);
  assert.nonEnumerable(Function.prototype, 'name');
  function foo() { /* empty */ }
  assert.same(foo.name, 'foo');
  assert.same(function () { /* empty */ }.name, '');
  if (Object.freeze) {
    assert.same(Object.freeze(() => { /* empty */ }).name, '');
  }
  function bar() { /* empty */ }
  bar.toString = function () {
    throw new Error();
  };
  assert.notThrows(() => bar.name === 'bar', 'works with redefined `.toString`');
  const baz = Object(() => { /* empty */ });
  baz.toString = function () {
    return '';
  };
  assert.same(baz.name, '');
});
