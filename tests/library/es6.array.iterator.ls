{module, test} = QUnit
module \ES6

{Symbol} = core
{keys, values, entries} = core.Array
{getPrototypeOf} = core.Object

test 'Array#@@iterator' (assert)!->
  assert.isFunction values
  iter = core.getIterator <[q w e]>
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter, iter[Symbol?iterator]()
  assert.notOk iter.hasOwnProperty(Symbol?iterator)
  assert.notOk getPrototypeOf(iter).hasOwnProperty(Symbol?iterator)
  assert.ok getPrototypeOf(getPrototypeOf(iter)).hasOwnProperty(Symbol?iterator)
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#keys' (assert)!->
  assert.isFunction keys
  iter = keys <[q w e]>
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: 0, done: no}
  assert.deepEqual iter.next!, {value: 1, done: no}
  assert.deepEqual iter.next!, {value: 2, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#values' (assert)!->
  assert.isFunction values
  iter = values <[q w e]>
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#entries' (assert)!->
  assert.isFunction entries
  iter = entries <[q w e]>
  assert.isIterator iter
  assert.isIterable iter
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: [0 \q], done: no}
  assert.deepEqual iter.next!, {value: [1 \w], done: no}
  assert.deepEqual iter.next!, {value: [2 \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
