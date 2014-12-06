QUnit.module 'ES6 Iterators'

eq = strictEqual
deq = deepEqual

{iterator, toStringTag} = Symbol

isIterator = ->
  return typeof it is \object  && typeof it.next is \function

test 'String#@@iterator' !->
  ok typeof String::[iterator] is \function, 'Is function'
  iter = 'qwe'[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'String Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
  eq Array.from(\𠮷𠮷𠮷).length, 3
  iter = '𠮷𠮷𠮷'[iterator]!
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: \𠮷, done: no}
  deq iter.next!, {value: void, done: on}

test 'Array#keys' !->
  ok typeof Array::keys is \function, 'Is function'
  iter = <[q w e]>keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: 0, done: no}
  deq iter.next!, {value: 1, done: no}
  deq iter.next!, {value: 2, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#values' !->
  ok typeof Array::values is \function, 'Is function'
  iter = <[q w e]>values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#entries' !->
  ok typeof Array::entries is \function, 'Is function'
  iter = <[q w e]>entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: [0 \q], done: no}
  deq iter.next!, {value: [1 \w], done: no}
  deq iter.next!, {value: [2 \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Array#@@iterator' !->
  ok typeof Array::[iterator] is \function, 'Is function'
  iter = <[q w e]>[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Array Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}

test 'Map#keys' !->
  ok typeof Map::keys is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: \a, done: no}
  deq iter.next!, {value: \s, done: no}
  deq iter.next!, {value: \d, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#values' !->
  ok typeof Map::values is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#entries' !->
  ok typeof Map::entries is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Map#@@iterator' !->
  ok typeof Map::[iterator] is \function, 'Is function'
  iter = new Map([[\a \q],[\s \w],[\d \e]])[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Map Iterator'
  deq iter.next!, {value: [\a \q], done: no}
  deq iter.next!, {value: [\s \w], done: no}
  deq iter.next!, {value: [\d \e], done: no}
  deq iter.next!, {value: void, done: on}

test 'Set#keys' !->
  ok typeof Set::keys is \function, 'Is function'
  iter = new Set(<[q w e]>)keys!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#values' !->
  ok typeof Set::values is \function, 'Is function'
  iter = new Set(<[q w e]>)values!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#entries' !->
  ok typeof Set::entries is \function, 'Is function'
  iter = new Set(<[q w e]>)entries!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: [\q \q], done: no}
  deq iter.next!, {value: [\w \w], done: no}
  deq iter.next!, {value: [\e \e], done: no}
  deq iter.next!, {value: void, done: on}
test 'Set#@@iterator' !->
  ok typeof Set::[iterator] is \function, 'Is function'
  iter = new Set(<[q w e]>)[iterator]!
  ok isIterator(iter), 'Return iterator'
  eq iter[toStringTag], 'Set Iterator'
  deq iter.next!, {value: \q, done: no}
  deq iter.next!, {value: \w, done: no}
  deq iter.next!, {value: \e, done: no}
  deq iter.next!, {value: void, done: on}