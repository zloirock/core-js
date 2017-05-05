{module, test} = QUnit
module \ES6

{Symbol} = core
{getPrototypeOf} = core.Object

test 'String#@@iterator' (assert)!->
  iter = core.getIterator 'qwe'
  assert.isIterator iter
  assert.strictEqual iter, iter[Symbol?iterator]()
  assert.notOk iter.hasOwnProperty(Symbol?iterator)
  assert.notOk getPrototypeOf(iter).hasOwnProperty(Symbol?iterator)
  assert.ok getPrototypeOf(getPrototypeOf(iter)).hasOwnProperty(Symbol?iterator)
  assert.strictEqual iter[core.Symbol?toStringTag], 'String Iterator'
  assert.deepEqual iter.next!, {value: \q, done: no}
  assert.deepEqual iter.next!, {value: \w, done: no}
  assert.deepEqual iter.next!, {value: \e, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
  assert.strictEqual core.Array.from(\𠮷𠮷𠮷).length, 3
  iter = core.getIterator '𠮷𠮷𠮷'
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: \𠮷, done: no}
  assert.deepEqual iter.next!, {value: void, done: on}
