import { createIterator } from '../helpers/helpers.js';

import from from 'core-js-pure/es/array/from';
import Iterator from 'core-js-pure/es/iterator';
import Symbol from 'core-js-pure/es/symbol';
import zip from 'core-js-pure/actual/iterator/zip';

QUnit.test('Iterator.zip', assert => {
  assert.isFunction(zip);
  assert.arity(zip, 1);
  assert.name(zip, 'zip');

  let result = zip([[1, 2, 3], [4, 5, 6]]);
  assert.true(result instanceof Iterator, 'Iterator instance');
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]]);
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]], { mode: 'longest', padding: [9] });
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6], [9, 7]]);
  result = zip([[1, 2, 3, 4], [5, 6, 7]], { mode: 'longest', padding: [1, 9] });
  assert.deepEqual(from(result), [[1, 5], [2, 6], [3, 7], [4, 9]]);
  result = zip([[1, 2, 3], [4, 5, 6], [7, 8, 9]], { mode: 'strict' });
  assert.deepEqual(from(result), [[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]], { mode: 'strict' });
  assert.throws(() => from(result), TypeError);

  const observableReturn = {
    return() {
      this.called = true;
      return { done: true, value: undefined };
    },
  };

  {
    const it1 = createIterator([1, 2], observableReturn);
    const it2 = createIterator([3, 4], observableReturn);
    result = zip([it1, it2]);
    assert.deepEqual(result.next().value, [1, 3]);
    assert.deepEqual(result.return(), { done: true, value: undefined });
    assert.deepEqual(result.next(), { done: true, value: undefined });
    assert.true(it1.called, 'first iterator return called');
    assert.true(it2.called, 'second iterator return called');
  }

  {
    const it = createIterator([1, 2, 3], observableReturn);
    result = zip([it, [4, 5]], { mode: 'strict' });
    assert.throws(() => from(result), TypeError);
    assert.true(it.called, 'iterator return called #1');
  }

  {
    const it = createIterator([3, 4, 5], observableReturn);
    result = zip([[1, 2], it], { mode: 'strict' });
    assert.throws(() => from(result), TypeError);
    assert.true(it.called, 'iterator return called #2');
  }

  {
    const it1 = createIterator([1, 2], { next() { throw new Error(); } });
    const it2 = createIterator([3, 4], observableReturn);
    result = zip([it1, it2]);
    assert.throws(() => from(result), Error);
    assert.true(it2.called, 'iterator return called #4');
  }

  {
    const expectedError = new TypeError('strict next error');
    let it2calls = 0;
    const it2 = createIterator([2], {
      next() {
        if (it2calls++) throw expectedError;
        return { value: 2, done: false };
      },
    });
    result = zip([createIterator([1]), it2], { mode: 'strict' });
    result.next();
    let caught;
    try {
      result.next();
    } catch (error) {
      caught = error;
    }
    assert.same(caught, expectedError, 'strict mode propagates error from .next() during exhaustion check');
  }

  {
    const $result = zip([
      [0, 1, 2],
      [3, 4, 5, 6, 7],
      [8, 9],
    ], {
      mode: 'longest',
    });

    assert.deepEqual(from($result), [
      [0, 3, 8],
      [1, 4, 9],
      [2, 5, undefined],
      [undefined, 6, undefined],
      [undefined, 7, undefined],
    ]);
  }

  {
    const $result = zip([
      [0, 1, 2],
      [3, 4, 5, 6, 7],
      [8, 9],
    ], {
      mode: 'longest',
      padding: ['A', 'B', 'C'],
    });

    assert.deepEqual(from($result), [
      [0, 3, 8],
      [1, 4, 9],
      [2, 5, 'C'],
      ['A', 6, 'C'],
      ['A', 7, 'C'],
    ]);
  }

  {
    const expectedError = new TypeError('not iterable');
    const badIterable = { [Symbol.iterator]() { throw expectedError; } };
    const it1 = createIterator([1, 2], observableReturn);
    let caught;
    try {
      zip([it1, badIterable]);
    } catch (error) {
      caught = error;
    }
    assert.same(caught, expectedError, 'original error is preserved');
    assert.true(it1.called, 'first iterator return called on non-iterable second element');
  }

  {
    const expectedError = new TypeError('inner return error');
    const throwingReturn = {
      return() {
        throw expectedError;
      },
    };
    const it1 = createIterator([1, 2], throwingReturn);
    const it2 = createIterator([3, 4], observableReturn);
    result = zip([it1, it2]);
    result.next();
    let caught;
    try {
      result.return();
    } catch (error) {
      caught = error;
    }
    assert.same(caught, expectedError, 'propagates the original error from inner return()');
  }

  assert.throws(() => zip(['hello', [1, 2, 3]]), TypeError, 'rejects string iterables');
  assert.throws(() => zip([42, [1, 2, 3]]), TypeError, 'rejects number iterables');
});
