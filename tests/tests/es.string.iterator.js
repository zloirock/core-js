import { GLOBAL } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('String#@@iterator', assert => {
  assert.isIterable(String.prototype);
  let iterator = 'qwe'[Symbol.iterator]();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'String Iterator');
  assert.deepEqual(iterator.next(), {
    value: 'q',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'w',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 'e',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
  assert.strictEqual(Array.from('𠮷𠮷𠮷').length, 3);
  iterator = '𠮷𠮷𠮷'[Symbol.iterator]();
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: '𠮷',
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});
