import { GLOBAL, NATIVE } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('Array#keys', assert => {
  const { keys } = Array.prototype;
  assert.isFunction(keys);
  assert.arity(keys, 0);
  assert.name(keys, 'keys');
  assert.looksNative(keys);
  assert.nonEnumerable(Array.prototype, 'keys');
  const iterator = ['q', 'w', 'e'].keys();
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.strictEqual(String(iterator), '[object Array Iterator]');
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
  if (NATIVE) {
    assert.deepEqual(keys.call({
      length: -1,
    }).next(), {
      value: undefined,
      done: true,
    }, 'uses ToLength');
  }
  assert.ok('keys' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#values', assert => {
  const { values } = Array.prototype;
  assert.isFunction(values);
  assert.arity(values, 0);
  assert.name(values, 'values');
  assert.looksNative(values);
  assert.nonEnumerable(Array.prototype, 'values');
  const iterator = ['q', 'w', 'e'].values();
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
  if (NATIVE) {
    assert.deepEqual(values.call({
      length: -1,
    }).next(), {
      value: undefined,
      done: true,
    }, 'uses ToLength');
  }
  assert.ok('values' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#entries', assert => {
  const { entries } = Array.prototype;
  assert.isFunction(entries);
  assert.arity(entries, 0);
  assert.name(entries, 'entries');
  assert.looksNative(entries);
  assert.nonEnumerable(Array.prototype, 'entries');
  const iterator = ['q', 'w', 'e'].entries();
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
  if (NATIVE) {
    assert.deepEqual(entries.call({
      length: -1,
    }).next(), {
      value: undefined,
      done: true,
    }, 'uses ToLength');
  }
  assert.ok('entries' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#@@iterator', assert => {
  assert.isIterable(Array.prototype);
  assert.arity(Array.prototype[Symbol.iterator], 0);
  assert.name(Array.prototype[Symbol.iterator], 'values');
  assert.looksNative(Array.prototype[Symbol.iterator]);
  assert.nonEnumerable(Array.prototype, Symbol.iterator);
  assert.strictEqual(Array.prototype[Symbol.iterator], Array.prototype.values);
  const iterator = ['q', 'w', 'e'][Symbol.iterator]();
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
  if (NATIVE) {
    assert.deepEqual(Array.prototype[Symbol.iterator].call({
      length: -1,
    }).next(), {
      value: undefined,
      done: true,
    }, 'uses ToLength');
  }
});
