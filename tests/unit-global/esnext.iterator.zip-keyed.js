import { createIterator } from '../helpers/helpers.js';

function nullProto(obj) {
  return Object.assign(Object.create(null), obj);
}

QUnit.test('Iterator.zipKeyed', assert => {
  const { zipKeyed } = Iterator;
  const { from } = Array;
  const { defineProperty } = Object;

  assert.isFunction(zipKeyed);
  assert.arity(zipKeyed, 1);
  assert.name(zipKeyed, 'zipKeyed');
  assert.looksNative(zipKeyed);
  assert.nonEnumerable(Iterator, 'zipKeyed');

  let result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5], c: [7, 8, 9] });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] }, { mode: 'longest', padding: { c: 10 } });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }, { a: undefined, b: 6, c: 10 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] }, { mode: 'strict' });
  assert.throws(() => from(result), TypeError);

  {
    let obj = {};
    defineProperty(obj, 'a', { get: () => [0, 1, 2], enumerable: true });
    defineProperty(obj, 'b', { get: () => [3, 4, 5], enumerable: true });
    defineProperty(obj, 'c', { get: () => [7, 8, 9], enumerable: true });
    defineProperty(obj, Symbol('d'), { get: () => [10, 11, 12] });
    assert.deepEqual(from(zipKeyed(obj)), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }]);

    const it = createIterator([1, 2], {
      return() {
        this.called = true;
        return { done: true, value: undefined };
      },
    });
    obj = { a: it };
    defineProperty(obj, 'b', { get: () => { throw new Error(); }, enumerable: true });
    assert.throws(() => from(zipKeyed(obj)), Error);
    assert.true(it.called, 'iterator return called');

    const foo = Symbol('foo');
    const bar = Symbol('bar');
    const zipped = Iterator.zipKeyed({ [foo]: [1, 2, 3], [bar]: [4, 5, 6], baz: [7, 8, 9] });
    result = from(zipped);
    assert.same(result[0][foo], 1);
    assert.same(result[0][bar], 4);
    assert.same(result[0].baz, 7);

    assert.same(result[1][foo], 2);
    assert.same(result[1][bar], 5);
    assert.same(result[1].baz, 8);

    assert.same(result[2][foo], 3);
    assert.same(result[2][bar], 6);
    assert.same(result[2].baz, 9);
  }

  {
    const $result = zipKeyed({
      a: [0, 1, 2],
      b: [3, 4, 5, 6, 7],
      c: [8, 9],
    }, {
      mode: 'longest',
    });

    assert.deepEqual(from($result), [
      nullProto({ a: 0, b: 3, c: 8 }),
      nullProto({ a: 1, b: 4, c: 9 }),
      nullProto({ a: 2, b: 5, c: undefined }),
      nullProto({ a: undefined, b: 6, c: undefined }),
      nullProto({ a: undefined, b: 7, c: undefined }),
    ]);
  }

  {
    const $result = zipKeyed({
      a: [0, 1, 2],
      b: [3, 4, 5, 6, 7],
      c: [8, 9],
    }, {
      mode: 'longest',
      padding: { a: 'A', b: 'B', c: 'C' },
    });

    assert.deepEqual(from($result), [
      nullProto({ a: 0, b: 3, c: 8 }),
      nullProto({ a: 1, b: 4, c: 9 }),
      nullProto({ a: 2, b: 5, c: 'C' }),
      nullProto({ a: 'A', b: 6, c: 'C' }),
      nullProto({ a: 'A', b: 7, c: 'C' }),
    ]);
  }
});
