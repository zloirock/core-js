import Symbol from 'core-js-pure/features/symbol';
import codePoints from 'core-js-pure/features/string/code-points';

QUnit.test('String#codePoints', assert => {
  assert.isFunction(codePoints);
  let iterator = codePoints('qwe');
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
  iterator = codePoints('𠮷𠮷𠮷');
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
