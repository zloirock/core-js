QUnit.module \$for
test '$for(iterable).of(fn)' !->
  ok typeof $for is \function, 'Is function'
  set = new Set <[1 2 3 2 1]>
  counter1 = 0
  string1  = ''
  # get iterator from iterable object
  $for set .of !->
    counter1++
    string1 += it
  ok counter1 is 3
  ok string1 is \123
  counter2 = 0
  string2  = ''
  # use iterator
  $for set.entries! .of !->
    counter2++
    string2 += it[0] + it[1]
  ok counter2 is 3
  ok string2 is \112233
  # additional args
  $for [1]entries!, on  .of (key, val)->
    ok @ is o
    ok key is 0
    ok val is 1
  , o = {}
test 'C.isIterable' !->
  {isIterable} = $for
  ok typeof isIterable is \function, 'Is function'
test 'C.getIterator' !->
  {getIterator} = $for
  ok typeof getIterator is \function, 'Is function'