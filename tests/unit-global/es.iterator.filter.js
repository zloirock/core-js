import { createIterator } from '../helpers/helpers.js';

const { from } = Array;

QUnit.test('Iterator#filter', assert => {
  const { filter } = Iterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.name(filter, 'filter');
  assert.looksNative(filter);
  assert.nonEnumerable(Iterator.prototype, 'filter');

  assert.arrayEqual(filter.call(createIterator([1, 2, 3]), it => it % 2).toArray(), [1, 3], 'basic functionality');

  from(filter.call(createIterator([1]), function (arg, counter) {
    assert.same(this, undefined, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  }));

  assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => filter.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => filter.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => filter.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => filter.call(it, {}), TypeError);
  assert.true(it.closed, 'filter closes iterator on validation error');
  // .return() on wrapper propagates to underlying iterator
  {
    let returnCount = 0;
    const it2 = createIterator([1, 2, 3], {
      return() {
        returnCount++;
        return { done: true, value: undefined };
      },
    });
    const filtered = filter.call(it2, x => x);
    filtered.next();
    filtered.return();
    assert.same(returnCount, 1, '.return() on filtered iterator propagates to underlying');
  }

  // .return() called when callback throws during iteration
  {
    let returnCount = 0;
    const it3 = createIterator([1, 2, 3], {
      return() {
        returnCount++;
        return { done: true, value: undefined };
      },
    });
    assert.throws(() => filter.call(it3, () => { throw new Error('test'); }).next(), Error);
    assert.same(returnCount, 1, '.return() called when callback throws');
  }

  // https://issues.chromium.org/issues/336839115
  assert.throws(() => filter.call({ next: null }, () => { /* empty */ }).next(), TypeError);
});
