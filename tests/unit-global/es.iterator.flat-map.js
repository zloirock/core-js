import { createIterator, createIterable } from '../helpers/helpers.js';

QUnit.test('Iterator#flatMap', assert => {
  const { flatMap } = Iterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.name(flatMap, 'flatMap');
  assert.looksNative(flatMap);
  assert.nonEnumerable(Iterator.prototype, 'flatMap');

  assert.arrayEqual(
    flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6]]), it => typeof it == 'number' ? [-it] : it).toArray(),
    [-1, -2, 3, 4, 5, 6],
    'basic functionality',
  );
  flatMap.call(createIterator([1]), function (arg, counter) {
    assert.same(this, undefined, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
    return [arg];
  }).toArray();

  // Should not throw an error for an iterator without `return` method. Fixed in Safari 26.2
  // https://bugs.webkit.org/show_bug.cgi?id=297532
  assert.notThrows(() => {
    const iter = flatMap.call(new Map([[4, 5]]).entries(), v => v);
    iter.next();
    iter.return();
  }, 'iterator without `return` method');

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => flatMap.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), it => it).next(), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => flatMap.call(it, {}), TypeError);
  assert.true(it.closed, "flatMap doesn't close iterator on validation error");
  // https://issues.chromium.org/issues/336839115
  assert.throws(() => flatMap.call({ next: null }, () => { /* empty */ }).next(), TypeError);
});
