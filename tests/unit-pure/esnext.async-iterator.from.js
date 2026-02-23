import Promise from 'core-js-pure/es/promise';
import assign from 'core-js-pure/es/object/assign';
import create from 'core-js-pure/es/object/create';
import values from 'core-js-pure/es/array/values';
import Symbol from 'core-js-pure/es/symbol';
import AsyncIterator from 'core-js-pure/actual/async-iterator';
import Iterator from 'core-js-pure/actual/iterator';

QUnit.test('AsyncIterator.from', assert => {
  const { from } = AsyncIterator;

  assert.isFunction(from);
  assert.arity(from, 1);

  assert.true(AsyncIterator.from(values([])) instanceof AsyncIterator, 'proxy, iterator');

  assert.true(AsyncIterator.from([]) instanceof AsyncIterator, 'proxy, iterable');

  const asyncIterator = assign(create(AsyncIterator.prototype), {
    next: () => { /* empty */ },
  });

  assert.same(AsyncIterator.from(asyncIterator), asyncIterator, 'does not wrap AsyncIterator instances');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);

  const closableIterator = {
    closed: false,
    [Symbol.iterator]() { return this; },
    next() {
      return { value: Promise.reject(42), done: false };
    },
    return() {
      this.closed = true;
      return { value: undefined, done: true };
    },
  };

  return AsyncIterator.from([1, Promise.resolve(2), 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'unwrap promises');
  }).then(() => {
    return from(Iterator.from(closableIterator)).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a `.next()` promise rejection');
    assert.true(closableIterator.closed, 'closes sync iterator on promise rejection');
  });
});

QUnit.test('AsyncIterator.from, sync iterator value forwarding', assert => {
  assert.expect(5);
  const async = assert.async();

  function * gen() {
    const x = yield 1;
    yield x;
  }

  const asyncIter = AsyncIterator.from(gen());

  asyncIter.next().then(r1 => {
    assert.same(r1.value, 1, 'first yield value');
    assert.false(r1.done, 'not done after first yield');
    return asyncIter.next(42);
  }).then(r2 => {
    assert.same(r2.value, 42, 'next(value) forwarded to sync generator');
    assert.false(r2.done, 'not done after second yield');
    return asyncIter.next();
  }).then(r3 => {
    assert.true(r3.done, 'done after generator completes');
    async();
  }).catch(() => {
    assert.avoid();
    async();
  });
});

QUnit.test('AsyncIterator.from, sync iterator throw forwarding', assert => {
  assert.expect(2);
  const async = assert.async();

  function * gen() {
    try {
      yield 1;
    } catch (error) {
      yield `caught: ${ error }`;
    }
  }

  const asyncIter = AsyncIterator.from(gen());

  asyncIter.next().then(() => {
    return asyncIter.throw('boom');
  }).then(result => {
    assert.same(result.value, 'caught: boom', 'throw(value) forwarded to sync generator');
    assert.false(result.done, 'not done after catch yield');
    async();
  }).catch(() => {
    assert.avoid();
    async();
  });
});

QUnit.test('AsyncIterator.from, throw closes iterator without throw method', assert => {
  assert.expect(2);
  const async = assert.async();

  let closeCalled = false;

  const iter = AsyncIterator.from({
    next() { return { value: 1, done: false }; },
    return() { closeCalled = true; return { value: undefined, done: true }; },
    [Symbol.iterator]() { return this; },
  });

  iter.next().then(() => {
    return iter.throw('error');
  }).then(() => {
    assert.avoid();
    async();
  }, error => {
    assert.true(error instanceof TypeError, 'rejects with new TypeError');
    assert.true(closeCalled, 'closes iterator when no throw method');
    async();
  });
});

QUnit.test('AsyncIterator.from, return(value) without iterator return method', assert => {
  assert.expect(2);
  const async = assert.async();

  const iter = AsyncIterator.from({
    next() { return { value: 1, done: false }; },
    [Symbol.iterator]() { return this; },
  });

  iter.return(42).then(result => {
    assert.same(result.value, 42, 'return(value) forwards value when no return method');
    assert.true(result.done, 'done is true');
    async();
  }).catch(() => {
    assert.avoid();
    async();
  });
});
