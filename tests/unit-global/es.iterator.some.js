import { createIterator } from '../helpers/helpers.js';

QUnit.test('Iterator#some', assert => {
  const { some } = Iterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.name(some, 'some');
  assert.looksNative(some);
  assert.nonEnumerable(Iterator.prototype, 'some');

  assert.true(some.call(createIterator([1, 2, 3]), it => it % 2), 'basic functionality #1');
  assert.false(some.call(createIterator([1, 2, 3]), it => typeof it == 'string'), 'basic functionality #2');
  some.call(createIterator([1]), function (arg, counter) {
    assert.same(this, undefined, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  });

  assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => some.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => some.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => some.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => some.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => some.call(it, {}), TypeError);
  assert.true(it.closed, "some doesn't close iterator on validation error");
});
