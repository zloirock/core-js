{module, test} = QUnit
module \ES6

isIterator = -> typeof it is \object && typeof it.next is \function

test 'Array#keys' (assert)->
  assert.isFunction Array::keys
  assert.arity Array::keys, 0
  assert.name Array::keys, \keys
  assert.looksNative Array::keys
  iter = <[q w e]>keys!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: 0, done: no}
  assert.deepEqual iter.next!, {value: 1, done: no}
  assert.deepEqual iter.next!, {value: 2, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \keys of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#values' (assert)->
  assert.isFunction Array::values
  assert.arity Array::values, 0
  #assert.name Array::values, \values # fails in V8
  assert.looksNative Array::values
  iter = <[q w e]>values!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \values of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#entries' (assert)->
  assert.isFunction Array::entries
  assert.arity Array::entries, 0
  assert.name Array::entries, \entries
  assert.looksNative Array::entries
  iter = <[q w e]>entries!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: [0 \q], done: no}
  assert.deepEqual iter.next!, {value: [1 \w], done: no}
  assert.deepEqual iter.next!, {value: [2 \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.ok \entries of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#@@iterator' (assert)->
  assert.isFunction Array::[Symbol?iterator]
  assert.arity Array::[Symbol?iterator], 0
  #assert.name Array::[Symbol?iterator], \values # fails in V8
  assert.looksNative Array::[Symbol?iterator]
  assert.strictEqual Array::[Symbol?iterator], Array::values
  iter = <[q w e]>[Symbol?iterator]!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}