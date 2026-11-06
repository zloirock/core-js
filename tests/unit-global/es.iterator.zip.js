import { createIterator, observableReturn } from '../helpers/helpers.js';
import { DESCRIPTORS } from '../helpers/constants.js';

QUnit.test('Iterator.zip', assert => {
  const { zip } = Iterator;
  const { from } = Array;
  const { defineProperty } = Object;

  assert.isFunction(zip);
  assert.arity(zip, 1);
  assert.name(zip, 'zip');
  assert.looksNative(zip);
  assert.nonEnumerable(Iterator, 'zip');

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

  {
    const it1 = createIterator([1, 2], observableReturn);
    const it2 = createIterator([3, 4], observableReturn);
    result = zip([it1, it2]);
    assert.deepEqual([it1.called, it2.called], [false, false], 'zip is lazy');
    assert.deepEqual(result.next().value, [1, 3]);
    assert.deepEqual([it1.called, it2.called], [true, true], 'next advances both iterators');
    assert.deepEqual([it1.returnCalls, it2.returnCalls], [0, 0], 'keeps both iterators open after next');
    assert.deepEqual(result.return(), { done: true, value: undefined });
    assert.deepEqual(result.next(), { done: true, value: undefined });
    assert.same(it1.returnCalls, 1, 'first iterator return called');
    assert.same(it2.returnCalls, 1, 'second iterator return called');
  }

  {
    const longer = createIterator([1, 2, 3], observableReturn);
    const shorter = createIterator([4, 5], observableReturn);
    result = zip([longer, shorter], { mode: 'strict' });
    assert.throws(() => from(result), TypeError);
    assert.same(longer.returnCalls, 1, 'iterator return called #1');
    assert.same(shorter.returnCalls, 0, 'does not close the exhausted second iterator');
  }

  {
    const shorter = createIterator([1, 2], observableReturn);
    const longer = createIterator([3, 4, 5], observableReturn);
    result = zip([shorter, longer], { mode: 'strict' });
    assert.throws(() => from(result), TypeError);
    assert.same(longer.returnCalls, 1, 'iterator return called #2');
    assert.same(shorter.returnCalls, 0, 'does not close the exhausted first iterator');
  }

  {
    const it1 = createIterator([1, 2], { ...observableReturn, next() { throw new Error(); } });
    const it2 = createIterator([3, 4], observableReturn);
    result = zip([it1, it2]);
    assert.throws(() => from(result), Error);
    assert.same(it1.returnCalls, 0, 'does not close the iterator whose next throws');
    assert.same(it2.returnCalls, 1, 'iterator return called #4');
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
    assert.same(it1.returnCalls, 1, 'first iterator return called on non-iterable second element');
  }

  {
    const expectedError = new TypeError('inner return error');
    const throwingReturn = {
      return() {
        throw expectedError;
      },
    };
    const it1 = createIterator([1, 2], observableReturn);
    const it2 = createIterator([3, 4], throwingReturn);
    result = zip([it1, it2]);
    result.next();
    let caught;
    try {
      result.return();
    } catch (error) {
      caught = error;
    }
    assert.same(caught, expectedError, 'propagates the original error from inner return()');
    assert.same(it1.returnCalls, 1, 'closes the remaining iterator when another return throws');
  }

  if (DESCRIPTORS) {
    const expectedError = new Error('input value');
    const closed = [];
    const inner = createIterator([], {
      return() {
        closed.push('inner');
        return {};
      },
    });
    let step = 0;
    const input = {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        if (!step++) return { done: false, value: inner };
        return defineProperty({ done: false }, 'value', {
          get() {
            throw expectedError;
          },
        });
      },
      return() {
        closed.push('input');
        return {};
      },
    };
    assert.throws(() => zip(input), error => error === expectedError, 'preserves the input value error');
    assert.deepEqual(closed, ['inner'], 'closes collected iterators without closing the input on a value error');
  }

  assert.throws(() => zip(['hello', [1, 2, 3]]), TypeError, 'rejects string iterables');
  assert.throws(() => zip([42, [1, 2, 3]]), TypeError, 'rejects number iterables');
  if (DESCRIPTORS) {
    let valueRead = false;
    const exhausted = () => ({
      next() {
        return defineProperty({ done: true }, 'value', {
          get() {
            valueRead = true;
            throw new Error('The value of a done result must not be read');
          },
        });
      },
    });
    assert.deepEqual(from(zip([exhausted(), [1, 2]])), [], 'shortest');
    assert.deepEqual(from(zip([[1], exhausted()], { mode: 'longest' })), [[1, undefined]], 'longest');
    assert.deepEqual(from(zip([exhausted(), exhausted()], { mode: 'strict' })), [], 'strict');
    assert.deepEqual(from(zip([[1], [2, 3]], {
      mode: 'longest',
      padding: { [Symbol.iterator]: exhausted },
    })), [[1, 2], [undefined, 3]], 'exhausted padding');
    assert.false(valueRead, 'the value of a done result is not read');
  }
  {
    // iterator-zip: .next() result must be validated as an object
    const primitiveNextIter = {
      [Symbol.iterator]() {
        return { next() { return 42; } };
      },
    };
    const normalIter = [1, 2, 3];
    const zipped = zip([primitiveNextIter, normalIter]);
    assert.throws(() => zipped.next(), TypeError, 'throws on non-object .next() result');
  }
  {
    const zipped = zip([{ next: () => ({ done: false, value: 1 }), return: () => zipped.next() }]);
    zipped.next();
    assert.throws(() => zipped.return(), TypeError, 'throws on re-entering a helper while it closes the iterators');
  }
});
