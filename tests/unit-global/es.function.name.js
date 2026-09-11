QUnit.test('Function#name', assert => {
  assert.true('name' in Function.prototype, 'name in Function.prototype');
  assert.nonEnumerable(Function.prototype, 'name');
  function foo() { /* empty */ }
  assert.same(foo.name, 'foo', 'named function');
  assert.same(function () { /* empty */ }.name, '', 'anonymous function');
  if (Object.freeze) {
    assert.same(Object.freeze(() => { /* empty */ }).name, '', 'frozen arrow function');
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
  assert.same(baz.name, '', 'empty `.toString`');

  assert.same(function /*
  multi-line comment */() { /* empty */ }.name, '', 'anonymous with multi-line comment');

  function /*
  multi-line comment */
  foobar() { /* empty */ }
  assert.same(foobar.name, 'foobar', 'named with multi-line comment before name');

  function // simple-line comment
  foobaz() { /* empty */ }
  assert.same(foobaz.name, 'foobaz', 'named with line comment before name');

  function // simple-line comment
  /* multi-line comment */quux/*
  multi-line comment
  */() { /* empty */ }
  assert.same(quux.name, 'quux', 'named with mixed comments around name');
});
