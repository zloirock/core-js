{module, test} = QUnit
module \core-js

test 'Number#@@iterator' (assert)!->
  {iterator, toStringTag} = Symbol
  assert.isIterable Number::
  iter1 = 2[iterator]!
  assert.isIterator iter1
  assert.isIterable iter1
  assert.ok iter1[toStringTag] is 'Number Iterator', '@@toStringTag'
  assert.deepEqual iter1.next!, {done: no, value: 0}, '2 #1'
  assert.deepEqual iter1.next!, {done: no, value: 1}, '2 #2'
  assert.deepEqual iter1.next!, {done: on, value: void}, '2 #3'
  iter2 = 1.5[iterator]!
  assert.deepEqual iter2.next!, {done: no, value: 0}, '1.5 #1'
  assert.deepEqual iter2.next!, {done: no, value: 1}, '1.5 #2'
  assert.deepEqual iter2.next!, {done: on, value: void}, '1.5 #3'
  iter3 = (-1)[iterator]!
  assert.deepEqual iter3.next!, {done: on, value: void}, '-1'
  iter4 = NaN[iterator]!
  assert.deepEqual iter4.next!, {done: on, value: void}, 'NaN'
  iter5 = Infinity[iterator]!
  assert.deepEqual iter5.next!, {done: no, value: 0}, 'Infinity #1'
  assert.deepEqual iter5.next!, {done: no, value: 1}, 'Infinity #1'
  assert.deepEqual iter5.next!, {done: no, value: 2}, 'Infinity #1'
  iter6 = (-Infinity)[iterator]!
  assert.deepEqual iter6.next!, {done: on, value: void}, '-Infinity'