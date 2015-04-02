QUnit.module 'core-js Number#@@iterator'

test '*' !->
  {getIterator} = core
  {toStringTag} = core.Symbol
  iter1 = getIterator 2
  ok iter1[toStringTag] is 'Number Iterator'
  deepEqual iter1.next!, {done: no, value: 0}
  deepEqual iter1.next!, {done: no, value: 1}
  deepEqual iter1.next!, {done: on, value: void}
  iter2 = getIterator 1.5
  deepEqual iter2.next!, {done: no, value: 0}
  deepEqual iter2.next!, {done: on, value: void}
  iter3 = getIterator -1
  deepEqual iter3.next!, {done: on, value: void}