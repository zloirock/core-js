import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#find', assert => {
  assert.expect(14);
  const async = assert.async();
  const { find } = AsyncIterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.name(find, 'find');
  assert.looksNative(find);
  assert.nonEnumerable(AsyncIterator.prototype, 'find');

  find.call(createIterator([2, 3, 4]), it => it % 2).then(result => {
    assert.same(result, 3, 'basic functionality, +');
    return find.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.same(result, undefined, 'basic functionality, -');
    return find.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    });
  }).then(() => async());

  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
});
