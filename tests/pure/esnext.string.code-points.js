import Symbol from 'core-js-pure/full/symbol';
import codePoints from 'core-js-pure/full/string/code-points';

QUnit.test('String#codePoints', assert => {
  assert.isFunction(codePoints);
  let iterator = codePoints('qwe');
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'String Iterator');
  assert.strictEqual(String(iterator), '[object String Iterator]');
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
  iterator = codePoints('𠮷𠮷𠮷');
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
});
