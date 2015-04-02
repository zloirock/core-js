QUnit.module 'ES6 Array Iterator'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next
{Symbol} = core
{keys, values, entries} = core.Array

test 'Array#@@iterator' !->
  ok isFunction(values), 'Is function'
  iter = core.getIterator <[q w e]>
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#keys' !->
  ok isFunction(keys), 'Is function'
  iter = keys <[q w e]>
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: 0, done: no}
  deq iter.next!, {value: 1, done: no}
  deq iter.next!, {value: 2, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#values' !->
  ok isFunction(values), 'Is function'
  iter = values <[q w e]>
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#entries' !->
  ok isFunction(entries), 'Is function'
  iter = entries <[q w e]>
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: [0 \q], done: no}
  deq iter.next!, {value: [1 \w], done: no}
  deq iter.next!, {value: [2 \e], done: no}
  deq iter.next!, {value: void, done: on}