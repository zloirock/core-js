QUnit.module 'core-js Number#@@iterator'

test '*' !->
  {iterator, toStringTag} = Symbol
  ok typeof! Number::[iterator] is \Function, 'Is function'
  iter1 = 2[iterator]!
  ok iter1[toStringTag] is 'Number Iterator'
  deepEqual iter1.next!, {done: no, value: 0}
  deepEqual iter1.next!, {done: no, value: 1}
  deepEqual iter1.next!, {done: on, value: void}
  iter2 = 1.5[iterator]!
  deepEqual iter2.next!, {done: no, value: 0}
  deepEqual iter2.next!, {done: on, value: void}
  iter3 = (-1)[iterator]!
  deepEqual iter3.next!, {done: on, value: void}