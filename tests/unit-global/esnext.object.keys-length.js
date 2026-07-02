QUnit.test('Object.keysLength', assert => {
  const { keysLength } = Object;
  assert.isFunction(keysLength);
  assert.name(keysLength, 'keysLength');
  assert.arity(keysLength, 1);
  assert.looksNative(keysLength);
  assert.nonEnumerable(Object, 'keysLength');

  assert.same(keysLength({ a: 1, b: 2 }), 2, 'Basic functionality');
  assert.same(keysLength({}), 0, 'Empty object');

  if (typeof Symbol == 'function') {
    assert.same(keysLength({ a: 1, [Symbol('s')]: 2 }), 1, 'Ignores symbol keys');
  }

  const nonEnum = { a: 1 };
  Object.defineProperty(nonEnum, 'hidden', {
    value: true,
    enumerable: false,
  });
  assert.same(keysLength(nonEnum), 1, 'Ignores non-enumerable own properties');

  const withAccessor = {};
  Object.defineProperty(withAccessor, 'foo', {
    get() { return 1; },
    enumerable: true,
  });
  assert.same(keysLength(withAccessor), 1, 'Counts enumerable accessors');

  const withNonEnumAccessor = {};
  Object.defineProperty(withNonEnumAccessor, 'bar', {
    get() { return 1; },
    enumerable: false,
  });
  assert.same(keysLength(withNonEnumAccessor), 0, 'Ignores non-enumerable accessors');

  const proto = { a: 1, b: 2 };
  const obj = Object.create(proto);
  obj.c = 3;
  Object.defineProperty(proto, 'd', {
    value: 4,
    enumerable: true,
  });
  assert.same(keysLength(obj), 1, 'Does not count inherited properties');

  const dict = Object.create(null);
  dict.x = 1;
  assert.same(keysLength(dict), 1, 'Works with null-prototype objects');

  assert.same(keysLength('abc'), 3, 'String primitive indices are own enumerable keys');
  assert.same(keysLength(42), 0, 'Number primitive has no enumerable string keys');
  assert.same(keysLength(true), 0, 'Boolean primitive has no enumerable string keys');

  const arr = ['a'];
  arr[2] = 'b';
  assert.same(keysLength(arr), 2, 'Array counts only present indices');

  assert.throws(() => keysLength(null), TypeError);
  assert.throws(() => keysLength(), TypeError);
});
