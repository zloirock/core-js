import { createIterator } from '../helpers/helpers.js';

import defineProperty from '@core-js/pure/actual/object/define-property';
import from from '@core-js/pure/es/array/from';
import Symbol from '@core-js/pure/full/symbol';
import zipKeyed from '@core-js/pure/full/iterator/zip-keyed';

QUnit.test('Iterator.zipKeyed', assert => {
  assert.isFunction(zipKeyed);
  assert.arity(zipKeyed, 1);
  assert.name(zipKeyed, 'zipKeyed');

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
  }
});
