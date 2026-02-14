import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

QUnit.test('Iterator#find', assert => {
  const { find } = Iterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.name(find, 'find');
  assert.looksNative(find);
  assert.nonEnumerable(Iterator.prototype, 'find');

  assert.same(find.call(createIterator([1, 2, 3]), it => !(it % 2)), 2, 'basic functionality');
  find.call(createIterator([1]), function (arg, counter) {
    assert.same(this, STRICT_THIS, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  });

  if (STRICT) {
    assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => find.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => find.call(it, {}), TypeError);
  assert.true(it.closed, 'find closes iterator on validation error');
});
