import { createIterator } from '../helpers/helpers.js';

QUnit.test('Iterator#map', assert => {
  const { map } = Iterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Iterator.prototype, 'map');

  assert.arrayEqual(map.call(createIterator([1, 2, 3]), it => it ** 2).toArray(), [1, 4, 9], 'basic functionality');
  map.call(createIterator([1]), function (arg, counter) {
    assert.same(this, undefined, 'this');
    assert.same(arguments.length, 2, 'arguments length');
    assert.same(arg, 1, 'argument');
    assert.same(counter, 0, 'counter');
  }).toArray();

  assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => map.call({}, () => { /* empty */ }).next(), TypeError);
  assert.throws(() => map.call([], () => { /* empty */ }).next(), TypeError);
  assert.throws(() => map.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => map.call(createIterator([1]), null), TypeError);
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => map.call(it, {}), TypeError);
  assert.true(it.closed, 'map closes iterator on validation error');

  {
    let returnCount = 0;
    const it2 = createIterator([1], {
      return() {
        returnCount++;
        return { done: true, value: undefined };
      },
    });
    const mapped = map.call(it2, x => x);
    mapped.next();
    mapped.next(); // exhaust
    mapped.return();
    assert.same(returnCount, 0, '.return() on exhausted iterator does not call underlying return');
  }

  // https://issues.chromium.org/issues/336839115
  assert.throws(() => map.call({ next: null }, () => { /* empty */ }).next(), TypeError);
});
