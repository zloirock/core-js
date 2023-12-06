import { createIterator } from '../helpers/helpers.js';

QUnit.test('Iterator#find', assert => {
  const { find } = Iterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.name(find, 'find');
  assert.looksNative(find);
  assert.nonEnumerable(Iterator.prototype, 'find');

  assert.same(find.call(createIterator([1, 2, 3]), it => !(it % 2)), 2, 'basic functionality');
  find.call(createIterator([1]), function (arg, counter) {
    assert.same(this, undefined, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  });

  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => find.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => find.call(it, {}), TypeError);
  assert.true(it.closed, 'find closes iterator on validation error');

  let returnCount = 0;
  const it2 = createIterator([1, 2, 3], {
    return() {
      returnCount++;
      throw new Error('close error');
    },
  });
  assert.throws(() => find.call(it2, () => true), Error, 'iterator.return() throwing on stop');
  assert.same(returnCount, 1, 'iterator.return() called exactly once when it throws');
});
