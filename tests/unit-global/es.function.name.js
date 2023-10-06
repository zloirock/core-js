QUnit.test('Function#name', assert => {
  assert.true('name' in Function.prototype);
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

  assert.same(function /*
  multi-line comment */() { /* empty */ }.name, '');

  function /*
  multi-line comment */
  foobar() { /* empty */ }
  assert.same(foobar.name, 'foobar');

  function // simple-line comment
  foobaz() { /* empty */ }
  assert.same(foobaz.name, 'foobaz');

  function // simple-line comment
  /* multi-line comment */quux/*
  multi-line comment
  */() { /* empty */ }
  assert.same(quux.name, 'quux');
});
