QUnit.test('Array#includes', assert => {
  const { includes } = Array.prototype;
  assert.isFunction(includes);
  assert.name(includes, 'includes');
  assert.arity(includes, 1);
  assert.looksNative(includes);
  assert.nonEnumerable(Array.prototype, 'includes');
  const object = {};
  const array = [1, 2, 3, -0, object];
  assert.true(array.includes(1));
  assert.true(array.includes(-0));
  assert.true(array.includes(0));
  assert.true(array.includes(object));
  assert.false(array.includes(4));
  assert.false(array.includes(-0.5));
  assert.false(array.includes({}));
  assert.true(Array(1).includes(undefined));
  assert.true([NaN].includes(NaN));

  assert.throws(() => includes.call(null, 0), TypeError);
  assert.throws(() => includes.call(undefined, 0), TypeError);

  assert.true('includes' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
