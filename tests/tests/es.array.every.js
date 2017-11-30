import { NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#every', assert => {
  const { every } = Array.prototype;
  assert.isFunction(every);
  assert.arity(every, 1);
  assert.name(every, 'every');
  assert.looksNative(every);
  assert.nonEnumerable(Array.prototype, 'every');
  let array = [1];
  const context = {};
  array.every(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok([1, 2, 3].every(it => typeof it === 'number'));
  assert.ok([1, 2, 3].every(it => it < 4));
  assert.ok(![1, 2, 3].every(it => it < 3));
  assert.ok(![1, 2, 3].every(it => typeof it === 'string'));
  assert.ok([1, 2, 3].every(function () {
    return +this === 1;
  }, 1));
  let result = '';
  [1, 2, 3].every((value, key) => result += key);
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(array.every((value, key, that) => that === array));
  if (STRICT) {
    assert.throws(() => {
      return every.call(null, () => { /* empty */ });
    }, TypeError);
    assert.throws(() => {
      return every.call(undefined, () => { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok((() => {
      try {
        return true === every.call({
          length: -1,
          0: 1,
        }, () => {
          throw new Error();
        });
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
});
