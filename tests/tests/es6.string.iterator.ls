{module, test} = QUnit
module \ES6

isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

test 'String#@@iterator' (assert)->
  assert.ok isFunction(String::[Symbol?iterator]), 'is function'
  iter = 'qwe'[Symbol?iterator]!
  assert.ok isIterator(iter), 'Return iterator'
  assert.strictEqual iter[Symbol?toStringTag], 'String Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.strictEqual Array.from(\𠮷𠮷𠮷).length, 3
  iter = '𠮷𠮷𠮷'[Symbol?iterator]!
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}