import { keys, values, entries } from 'core-js-pure/full/array';
import Symbol from 'core-js-pure/full/symbol';
import getIterator from 'core-js-pure/full/get-iterator';

QUnit.test('Array#@@iterator', assert => {
  assert.isFunction(values);
  const iterator = getIterator(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.strictEqual(String(iterator), '[object Array Iterator]');
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
});

QUnit.test('Array#keys', assert => {
  assert.isFunction(keys);
  const iterator = keys(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: 0,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: 2,
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});

QUnit.test('Array#values', assert => {
  assert.isFunction(values);
  const iterator = values(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
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
});

QUnit.test('Array#entries', assert => {
  assert.isFunction(entries);
  const iterator = entries(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: [0, 'q'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: [1, 'w'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: [2, 'e'],
    done: false,
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true,
  });
});
