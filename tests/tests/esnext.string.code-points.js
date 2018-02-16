import { GLOBAL } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#codePoints', assert => {
  const { codePoints } = String.prototype;
  assert.isFunction(codePoints);
  assert.arity(codePoints, 0);
  assert.name(codePoints, 'codePoints');
  assert.looksNative(codePoints);
  assert.nonEnumerable(String.prototype, 'codePoints');
  let iterator = 'qwe'.codePoints();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'String Iterator');
  assert.strictEqual(String(iterator), '[object String Iterator]');
  assert.deepEqual(iterator.next(), {
    value: 113,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 119,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 101,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  iterator = '𠮷𠮷𠮷'.codePoints();
  assert.deepEqual(iterator.next(), {
    value: 134071,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 134071,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 134071,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
