import { STRICT } from '../helpers/constants';

import Promise from 'core-js-pure/es/promise';
import Set from 'core-js-pure/es/set';
import Iterator from 'core-js-pure/actual/iterator';
import 'core-js-pure/actual/async-iterator';

QUnit.test('Iterator#toAsync', assert => {
  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);

  if (STRICT) {
    assert.throws(() => toAsync.call(undefined), TypeError);
    assert.throws(() => toAsync.call(null), TypeError);
  }

  return Iterator.from([1, 2, 3]).toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    return Iterator.from(new Set([1, 2, 3])).toAsync().map(el => Promise.resolve(el)).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
  });
});
