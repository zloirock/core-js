QUnit.test('String#sup', assert => {
  const { sup } = String.prototype;
  assert.isFunction(sup);
  assert.arity(sup, 0);
  assert.name(sup, 'sup');
  assert.looksNative(sup);
  assert.nonEnumerable(String.prototype, 'sup');
  assert.same('a'.sup(), '<sup>a</sup>', 'lower case');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => sup.call(Symbol()), 'throws on symbol context');
  }
});
