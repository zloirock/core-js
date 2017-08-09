{module, test} = QUnit
module \ES

test 'Array#keys' (assert)!->
  assert.isFunction Array::keys
  assert.arity Array::keys, 0
  assert.name Array::keys, \keys
  assert.looksNative Array::keys
  assert.nonEnumerable Array::, \keys
  iter = <[q w e]>keys!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: 0, done: no}
  assert.deepEqual iter.next!, {value: 1, done: no}
  assert.deepEqual iter.next!, {value: 2, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  if NATIVE
    assert.deepEqual Array::keys.call({length: -1}).next!, {value: void, done: on}, 'uses ToLength'
  assert.ok \keys of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#values' (assert)!->
  assert.isFunction Array::values
  assert.arity Array::values, 0
  assert.name Array::values, \values # fails in V8 and FF
  assert.looksNative Array::values
  assert.nonEnumerable Array::, \values
  iter = <[q w e]>values!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  if NATIVE
    assert.deepEqual Array::values.call({length: -1}).next!, {value: void, done: on}, 'uses ToLength'
  assert.ok \values of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#entries' (assert)!->
  assert.isFunction Array::entries
  assert.arity Array::entries, 0
  assert.name Array::entries, \entries
  assert.looksNative Array::entries
  assert.nonEnumerable Array::, \entries
  iter = <[q w e]>entries!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: [0 \q], done: no}
  assert.deepEqual iter.next!, {value: [1 \w], done: no}
  assert.deepEqual iter.next!, {value: [2 \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  if NATIVE
    assert.deepEqual Array::entries.call({length: -1}).next!, {value: void, done: on}, 'uses ToLength'
  assert.ok \entries of Array::[Symbol?unscopables], 'In Array#@@unscopables'

test 'Array#@@iterator' (assert)!->
  assert.isIterable Array::
  assert.arity Array::[Symbol?iterator], 0
  assert.name Array::[Symbol?iterator], \values # fails in V8 and FF
  assert.looksNative Array::[Symbol?iterator]
  assert.nonEnumerable Array::, Symbol?iterator
  assert.strictEqual Array::[Symbol?iterator], Array::values
  iter = <[q w e]>[Symbol?iterator]!
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  if NATIVE
    assert.deepEqual Array::[Symbol?iterator].call({length: -1}).next!, {value: void, done: on}, 'uses ToLength'