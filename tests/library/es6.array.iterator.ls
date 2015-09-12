{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next
{Symbol} = core
{keys, values, entries} = core.Array

test 'Array#@@iterator' (assert)->
  assert.ok isFunction(values), 'Is function'
  iter = core.getIterator <[q w e]>
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#keys' (assert)->
  assert.ok isFunction(keys), 'Is function'
  iter = keys <[q w e]>
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: 0, done: no}
  assert.deepEqual iter.next!, {value: 1, done: no}
  assert.deepEqual iter.next!, {value: 2, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#values' (assert)->
  assert.ok isFunction(values), 'Is function'
  iter = values <[q w e]>
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}

test 'Array#entries' (assert)->
  assert.ok isFunction(entries), 'Is function'
  iter = entries <[q w e]>
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'Array Iterator'
  assert.deepEqual iter.next!, {value: [0 \q], done: no}
  assert.deepEqual iter.next!, {value: [1 \w], done: no}
  assert.deepEqual iter.next!, {value: [2 \e], done: no}
  assert.deepEqual iter.next!, {value: void, done: on}