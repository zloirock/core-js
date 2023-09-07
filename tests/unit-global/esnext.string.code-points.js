import { GLOBAL } from '../helpers/constants.js';

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
  assert.same(iterator[Symbol.toStringTag], 'String Iterator');
  assert.same(String(iterator), '[object String Iterator]');
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 113, position: 0 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 119, position: 1 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 101, position: 2 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  iterator = '𠮷𠮷𠮷'.codePoints();
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 134071, position: 0 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 134071, position: 2 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: { codePoint: 134071, position: 4 },
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });

  assert.throws(() => codePoints.call(Symbol()), 'throws on symbol context');
});
