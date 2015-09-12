{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

test 'Array#keys' (assert)->
  assert.ok isFunction(Array::keys), 'is function'
  assert.strictEqual Array::keys.length, 0, 'arity is 0'
  assert.strictEqual Array::keys.name, \keys, 'name is "keys"'
  assert.ok /native code/.test(Array::keys), 'looks like native'
  iter = <[q w e]>keys!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: 0, done: no}
  assert.deepEqual iter.next!, {value: 1, done: no}
  assert.deepEqual iter.next!, {value: 2, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \keys of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#values' (assert)->
  assert.ok isFunction(Array::values), 'is function'
  assert.strictEqual Array::values.length, 0, 'arity is 0'
  #assert.strictEqual Array::values.name, \values, 'name is "values"' # fails in V8
  assert.ok /native code/.test(Array::values), 'looks like native'
  iter = <[q w e]>values!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \values of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#entries' (assert)->
  assert.ok isFunction(Array::entries), 'is function'
  assert.strictEqual Array::entries.length, 0, 'arity is 0'
  assert.strictEqual Array::entries.name, \entries, 'name is "entries"'
  assert.ok /native code/.test(Array::entries), 'looks like native'
  iter = <[q w e]>entries!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: [0 \q], done: no}
  assert.deepEqual iter.next!, {value: [1 \w], done: no}
  assert.deepEqual iter.next!, {value: [2 \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \entries of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#@@iterator' (assert)->
  assert.ok isFunction(Array::[Symbol?iterator]), 'is function'
  assert.strictEqual Array::[Symbol?iterator].length, 0, 'arity is 0'
  #assert.strictEqual Array::[Symbol?iterator].name, \values, 'name is "values"' # fails in V8
  assert.ok /native code/.test(Array::[Symbol?iterator]), 'looks like native'
  assert.strictEqual Array::[Symbol?iterator], Array::values
  iter = <[q w e]>[Symbol?iterator]!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}