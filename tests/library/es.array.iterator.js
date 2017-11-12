var Symbol = core.Symbol;
var keys = core.Array.keys;
var values = core.Array.values;
var entries = core.Array.entries;

QUnit.test('Array#@@iterator', function (assert) {
  assert.isFunction(values);
  var iterator = core.getIterator(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
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
});

QUnit.test('Array#keys', function (assert) {
  assert.isFunction(keys);
  var iterator = keys(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: 0,
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 1,
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: 2,
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});

QUnit.test('Array#values', function (assert) {
  assert.isFunction(values);
  var iterator = values(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
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
});

QUnit.test('Array#entries', function (assert) {
  assert.isFunction(entries);
  var iterator = entries(['q', 'w', 'e']);
  assert.isIterator(iterator);
  assert.isIterable(iterator);
  assert.strictEqual(iterator[Symbol.toStringTag], 'Array Iterator');
  assert.deepEqual(iterator.next(), {
    value: [0, 'q'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: [1, 'w'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: [2, 'e'],
    done: false
  });
  assert.deepEqual(iterator.next(), {
    value: undefined,
    done: true
  });
});
