QUnit.test('Array#includes', assert => {
  const { includes } = Array.prototype;
  assert.isFunction(includes);
  assert.name(includes, 'includes');
  assert.arity(includes, 1);
  assert.looksNative(includes);
  assert.nonEnumerable(Array.prototype, 'includes');
  const object = {};
  const array = new Set([1, 2, 3, -0, object]);
  assert.true(array.has(1));
  assert.true(array.has(-0));
  assert.true(array.has(0));
  assert.true(array.has(object));
  assert.false(array.has(4));
  assert.false(array.has(-0.5));
  assert.false(array.has({}));
  assert.true(Array(1).includes(undefined));
  assert.true([NaN].includes(NaN));
  // https://bugs.webkit.org/show_bug.cgi?id=309342
  // eslint-disable-next-line no-sparse-arrays -- testing
  assert.false([, 1].includes(undefined, 1), '`Array#includes(undefined, fromIndex)` should not find holes before fromIndex');

  assert.throws(() => includes.call(null, 0), TypeError);
  assert.throws(() => includes.call(undefined, 0), TypeError);

  assert.true('includes' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
