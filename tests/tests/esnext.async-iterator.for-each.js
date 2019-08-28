import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#forEach', assert => {
  assert.expect(13);
  const async = assert.async();
  const { forEach } = AsyncIterator.prototype;

  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  assert.looksNative(forEach);
  assert.nonEnumerable(AsyncIterator.prototype, 'forEach');

  const array = [];

  forEach.call(createIterator([1, 2, 3]), it => array.push(it)).then(() => {
    assert.arrayEqual(array, [1, 2, 3], 'basic functionality');
    return forEach.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    });
  }).then(() => async());

  assert.throws(() => forEach.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => forEach.call([], () => { /* empty */ }), TypeError);
});
