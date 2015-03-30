QUnit.module 'ES6 Array Iterator'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function
isIterator = -> typeof it is \object && isFunction it.next

test 'Array#keys' !->
  ok isFunction(Array::keys), 'Is function'
  iter = <[q w e]>keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: 0, done: no}
  deq iter.next!, {value: 1, done: no}
  deq iter.next!, {value: 2, done: no}
  deq iter.next!, {value: void, done: on}
  ok \keys of Array::[Symbol?unscopables], 'In Array#@@unscopables'
test 'Array#values' !->
  ok isFunction(Array::values), 'Is function'
  iter = <[q w e]>values!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  ok \values of Array::[Symbol?unscopables], 'In Array#@@unscopables'
test 'Array#entries' !->
  ok isFunction(Array::entries), 'Is function'
  iter = <[q w e]>entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: [0 \q], done: no}
  deq iter.next!, {value: [1 \w], done: no}
  deq iter.next!, {value: [2 \e], done: no}
  deq iter.next!, {value: void, done: on}
  ok \entries of Array::[Symbol?unscopables], 'In Array#@@unscopables'
test 'Array#@@iterator' !->
  ok isFunction(Array::[Symbol?iterator]), 'Is function'
  eq Array::[Symbol?iterator], Array::values
  iter = <[q w e]>[Symbol?iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[Symbol?toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}