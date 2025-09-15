import { createIterator } from '../helpers/helpers.js';

import from from '@core-js/pure/es/array/from';
import zip from '@core-js/pure/full/iterator/zip';

QUnit.test('Iterator.zip', assert => {
  assert.isFunction(zip);
  assert.arity(zip, 1);
  assert.name(zip, 'zip');

  let result = zip([[1, 2, 3], [4, 5, 6]]);
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
});
