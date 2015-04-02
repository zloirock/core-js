QUnit.module 'ES6 String Iterator'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

test '*' !->
  iter = core.getIterator 'qwe'
  eq iter[core.Symbol?toStringTag], 'String Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  eq core.Array.from(\𠮷𠮷𠮷).length, 3
  iter = core.getIterator '𠮷𠮷𠮷'
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: void, done: on}