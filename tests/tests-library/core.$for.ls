QUnit.module 'core-js $for'
{$for, Set, Symbol} = core
{from, entries, values} = core.Array
test '$for' !->
  ok typeof $for is \function, 'Is function'
  ok Symbol?iterator of $for::
  set = new Set <[1 2 3 2 1]>
  iter = $for set
  ok iter instanceof $for
  ok core.Object.classof(iter[Symbol?iterator]!) is 'Set Iterator'
  deepEqual <[1 2 3]>, from iter
test '$for#filter' !->
  ok typeof $for::filter is \function, 'Is function'
  set = new Set <[1 2 3 2 1]>
  iter = $for set .filter (% 2)
  ok iter instanceof $for
  deepEqual <[1 3]>, from iter
  deepEqual [[1 2]], from $for(entries([1 2 3]), on).filter (k, v)-> k % 2
  $for [1] .filter ->
    ok @ is o
  , o = {}
test '$for#map' !->
  ok typeof $for::map is \function, 'Is function'
  set = new Set <[1 2 3 2 1]>
  iter = $for set .map (* 2)
  ok iter instanceof $for
  deepEqual [2 4 6], from iter
  deepEqual [[0 1], [2 4], [4 9]], from $for(entries([1 2 3]), on).map (k, v)-> [k * 2, v * v]
  $for [1] .map ->
    ok @ is o
  , o = {}
test '$for#array' !->
  ok typeof $for::array is \function, 'Is function'
  set = new Set [1 2 3 2 1]
  deepEqual([[1 1], [2 2], [3 3]], $for set.entries! .array!)
  deepEqual([2 4 6], $for set .array (* 2))
  deepEqual([[0 1], [2 4], [4 9]], $for(entries([1 2 3]), on).array (k, v)-> [k * 2, v * v])
  $for [1] .array ->
    ok @ is o
  , o = {}
test '$for#of' !->
  ok typeof $for::of is \function, 'Is function'
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
  $for entries([1]), on  .of (key, val)->
    ok @ is o
    ok key is 0
    ok val is 1
  , o = {}
  # return #default
  done = on
  iter = values [1 2 3]
  iter.return = ->
    done := no
    {done: on}
  $for(iter).of ->
  ok done, '.return #default'
  # return #break
  done = no
  iter = values [1 2 3]
  iter.return = ->
    done := on
    {done: on}
  $for(iter).of -> return no
  ok done, '.return #break'
  # return #throw
  done = no
  iter = values [1 2 3]
  iter.return = ->
    done := on
    {done: on}
  try => $for(iter).of -> throw 42
  ok done, '.return #throw'
test '$for chaining' !->
  deepEqual([2, 10], $for [1 2 3]
    .map (^ 2)
    .filter (% 2)
    .map (+ 1)
    .array!)
  deepEqual([[1, 1], [3, 9]], $for (entries [1 2 3]), on
    .map (k, v)-> [k, v ^ 2]
    .filter (k, v)-> v % 2
    .map (k, v)-> [k + 1, v]
    .array!)