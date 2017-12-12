import { NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#some', assert => {
  const { some } = Array.prototype;
  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.looksNative(some);
  assert.nonEnumerable(Array.prototype, 'some');
  let array = [1];
  const context = {};
  array.some(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok([1, '2', 3].some(value => typeof value === 'number'));
  assert.ok([1, 2, 3].some(value => value < 3));
  assert.ok(![1, 2, 3].some(value => value < 0));
  assert.ok(![1, 2, 3].some(value => typeof value === 'string'));
  assert.ok(![1, 2, 3].some(function () {
    return +this !== 1;
  }, 1));
  let result = '';
  [1, 2, 3].some((value, key) => {
    result += key;
    return false;
  });
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(!array.some((value, key, that) => that !== array));
  if (STRICT) {
    assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
    assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  }
  if (NATIVE) {
    assert.notThrows(() => some.call({
      length: -1,
      0: 1,
    }, () => {
      throw new Error();
    }) === false, 'uses ToLength');
  }
});
