import { getIterator, Symbol } from 'core-js-pure';
import from from 'core-js-pure/fn/array/from';

QUnit.test('String#@@iterator', assert => {
  let iterator = getIterator('qwe');
  assert.isIterator(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'String Iterator');
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
  assert.strictEqual(from('𠮷𠮷𠮷').length, 3);
  iterator = getIterator('𠮷𠮷𠮷');
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
});
