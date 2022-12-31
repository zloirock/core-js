import { GLOBAL } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#@@iterator', assert => {
  assert.isIterable(String.prototype);
  let iterator = 'qwe'[Symbol.iterator]();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.same(iterator[Symbol.toStringTag], 'String Iterator');
  assert.same(String(iterator), '[object String Iterator]');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
  assert.same(Array.from('𠮷𠮷𠮷').length, 3);
  iterator = '𠮷𠮷𠮷'[Symbol.iterator]();
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });

  // early FF case with native method, but polyfilled `Symbol`
  // assert.throws(() => ''[Symbol.iterator].call(Symbol()), 'throws on symbol context');
});
