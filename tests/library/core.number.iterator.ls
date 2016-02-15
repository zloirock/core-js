{module, test} = QUnit
module \core-js

test 'Number#@@iterator' (assert)!->
  {getIterator} = core
  {toStringTag} = core.Symbol
  iter1 = getIterator 2
  assert.isIterator iter1
  assert.isIterable iter1
  assert.ok iter1[toStringTag] is 'Number Iterator', '@@toStringTag'
  assert.deepEqual iter1.next!, {done: no, value: 0}, '2 #1'
  assert.deepEqual iter1.next!, {done: no, value: 1}, '2 #2'
  assert.deepEqual iter1.next!, {done: on, value: void}, '2 #3'
  iter2 = getIterator 1.5
  assert.deepEqual iter2.next!, {done: no, value: 0}, '1.5 #1'
  assert.deepEqual iter2.next!, {done: no, value: 1}, '1.5 #2'
  assert.deepEqual iter2.next!, {done: on, value: void}, '1.5 #3'
  iter3 = getIterator -1
  assert.deepEqual iter3.next!, {done: on, value: void}, '-1'
  iter4 = getIterator NaN
  assert.deepEqual iter4.next!, {done: on, value: void}, 'NaN'
  iter5 = getIterator Infinity
  assert.deepEqual iter5.next!, {done: no, value: 0}, 'Infinity #1'
  assert.deepEqual iter5.next!, {done: no, value: 1}, 'Infinity #1'
  assert.deepEqual iter5.next!, {done: no, value: 2}, 'Infinity #1'
  iter6 = getIterator -Infinity
  assert.deepEqual iter6.next!, {done: on, value: void}, '-Infinity'