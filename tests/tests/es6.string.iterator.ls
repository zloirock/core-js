QUnit.module 'ES6 String Iterator'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

test '*' !->
  ok isFunction(String::[Symbol?iterator]), 'Is function'
  iter = 'qwe'[Symbol?iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'String Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  eq Array.from(\𠮷𠮷𠮷).length, 3
  iter = '𠮷𠮷𠮷'[Symbol?iterator]!
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: void, done: on}