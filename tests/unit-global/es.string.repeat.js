QUnit.test('String#repeat', assert => {
  const { repeat } = String.prototype;
  assert.isFunction(repeat);
  assert.arity(repeat, 1);
  assert.name(repeat, 'repeat');
  assert.looksNative(repeat);
  assert.nonEnumerable(String.prototype, 'repeat');
  assert.same('qwe'.repeat(3), 'qweqweqwe');
  assert.same('qwe'.repeat(2.5), 'qweqwe');
  assert.throws(() => 'qwe'.repeat(-1), RangeError);
  assert.throws(() => 'qwe'.repeat(Infinity), RangeError);

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => repeat.call(Symbol('repeat test')), 'throws on symbol context');
  }

  assert.throws(() => repeat.call(null, 1), TypeError);
  assert.throws(() => repeat.call(undefined, 1), TypeError);
});
