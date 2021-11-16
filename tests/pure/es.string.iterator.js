import Symbol from 'core-js-pure/features/symbol';
import getIterator from 'core-js-pure/features/get-iterator';
import getIteratorMethod from 'core-js-pure/features/get-iterator-method';
import from from 'core-js-pure/features/array/from';

QUnit.test('String#@@iterator', assert => {
  let iterator = getIterator('qwe');
  assert.isIterator(iterator);
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
  assert.same(from('𠮷𠮷𠮷').length, 3);
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

  assert.throws(() => getIteratorMethod('').call(Symbol()), 'throws on symbol context');
});
