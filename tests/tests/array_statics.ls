isFunction = -> typeof! it is \Function
{slice} = Array::
test 'Array static are functions' !->
  for <[concat join pop push reverse shift slice sort splice unshift indexOf lastIndexOf every some forEach map filter reduce reduceRight fill find findIndex keys values entries get turn clone contains]>
    ok isFunction(Array[..]), "Array.#{..} is function"
test 'Array.join' !->
  {join} = Array
  ok join(\123, \|) is \1|2|3
  ok join((-> &)(3 2 1), \|) is \3|2|1
test 'Array.pop' !->
  {pop} = Array
  ok pop(args = (-> &)(1 2 3)) is 3
  deepEqual args, (-> &)(1 2)
test 'Array.push' !->
  {push} = Array
  push args = (-> &)(1 2 3), 4 5
  # don't enum arguments props in ie 8-
  deepEqual slice.call(args), [1 2 3 4 5]
test 'Array.reverse' !->
  {reverse} = Array
  deepEqual reverse((-> &)(1 2 3)), (-> &)(3 2 1)
test 'Array.shift' !->
  {shift} = Array
  ok shift(args = (-> &)(1 2 3)) is 1
  deepEqual args, (-> &)(2 3)
test 'Array.unshift' !->
  {unshift} = Array
  unshift args = (-> &)(1 2 3), 4 5
  # don't enum arguments props in ie 8-
  deepEqual slice.call(args), [4 5 1 2 3]
test 'Array.slice' !->
  {slice} = Array
  deepEqual slice(\123), <[1 2 3]>
  deepEqual slice(\123 1), <[2 3]>
  deepEqual slice(\123 1 2), <[2]>
  deepEqual slice(\123 1 -1), <[2]>
  deepEqual slice((-> &)(1 2 3)), [1 2 3]
  deepEqual slice((-> &)(1 2 3), 1), [2 3]
  deepEqual slice((-> &)(1 2 3), 1, 2), [2]
  deepEqual slice((-> &)(1 2 3), 1, -1), [2]
test 'Array.splice' !->
  {splice} = Array
  splice args = (-> &)(1 2 3), 1 0 4 5
  # don't enum arguments props in ie 8-
  deepEqual slice.call(args), [1 4 5 2 3]
  splice args = (-> &)(1 2 3), 1 1 4
  deepEqual slice.call(args), [1 4 3]
  splice args = (-> &)(1 2 3), 1 1
  deepEqual slice.call(args), [1 3]
test 'Array.sort' !->
  {sort} = Array
  deepEqual sort((-> &)(2 1 3)), (-> &)(1 2 3)
  deepEqual sort((-> &)(11 2 3)), (-> &)(11 2 3)
  deepEqual sort((-> &)(11 2 3), (a, b)-> a - b), (-> &)(2 3 11)
test 'Array.indexOf' !->
  {indexOf} = Array
  ok indexOf(\111 \1) is 0
  ok indexOf(\123 \1 1) is -1
  ok indexOf(\123 \2 1) is 1
  ok indexOf((-> &)(1 1 1), 1) is 0
  ok indexOf((-> &)(1 2 3), 1 1) is -1
  ok indexOf((-> &)(1 2 3), 2 1) is 1
test 'Array.lastIndexOf' !->
  {lastIndexOf} = Array
  ok lastIndexOf(\111 \1) is 2
  ok lastIndexOf(\123 \3 1) is -1
  ok lastIndexOf(\123 \2 1) is 1
  ok lastIndexOf((-> &)(1 1 1), 1) is 2
  ok lastIndexOf((-> &)(1 2 3), 3 1) is -1
  ok lastIndexOf((-> &)(1 2 3), 2 1) is 1
test 'Array.every' !->
  {every} = Array
  every al = (->&)(1), (val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  , ctx = {}
  ok every  \123 -> typeof! it is \String
  ok every  \123 -> &1 < 3
  ok not every \123 -> typeof! it is \Number
  ok not every \123 -> &1 < 2
  ok every  \123 -> &2 ~= \123
  ok every  (->&)(1,2,3), -> typeof! it is \Number
test 'Array.some' !->
  {some} = Array
  some al = (->&)(1), (val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  , ctx = {}
  ok some  \123 -> typeof! it is \String
  ok some  \123 -> &1 > 1
  ok not some \123 -> typeof! it is \Number
  ok not some \123 -> &1 > 3
  ok some  \123 -> &2 ~= \123
  ok some  (-> &)(1 2 3), -> typeof! it is \Number
test 'Array.forEach' !->
  {forEach} = Array
  forEach al = (->&)(1), (val, key, that)!->
    ok @    is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  val = ''
  forEach \123 (v, k, t)!-> val += v + k + t
  ok val is \101232112332123
  val = ''
  forEach (-> &)(1 2 3), (v, k, t)!-> val += v + k + t\2
  ok val is \468
  val = ''
  forEach \123 ((v, k, t)!-> val += v + k + t + @), 1
  ok val is \101231211231321231
test 'Array.map' !->
  {map} = Array
  map al = (->&)(1), (val, key, that)->
    ok @    is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  deepEqual map(\123 (^2)), [1 4 9]
  deepEqual map((-> &)(1 2 3), (^2)), [1 4 9]
test 'Array.filter' !->
  {filter} = Array
  filter al = (->&)(1), (val, key, that)->
    ok @    is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  deepEqual filter(\123, -> it > 1), <[2 3]>
  deepEqual filter((-> &)(1 2 3), -> it < 3), [1,2]
  deepEqual filter(\123 -> &1 != 1), <[1 3]>
test 'Array.reduce' !->
  {reduce} = Array
  reduce al = (->&)(1), (memo, val, key, that)->
    ok memo is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  reduce al = (->&)(1 2), (memo)->
    ok memo is 1
  ok reduce(\123 ((+a, +b)-> a + b)) is 6
  ok reduce((-> &)(1 2 3), (a, b)-> '' + b * b + a) is \941
  ok reduce(\123 ((+a, +b)-> a + b), 1) is 7
test 'Array.reduceRight' !->
  {reduceRight} = Array
  reduceRight al = (->&)(1), (memo, val, key, that)->
    ok memo is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  reduceRight al = (->&)(1 2), (memo)->
    ok memo is 2
  ok reduceRight(\123 ((+a, +b)-> a + b)) is 6
  ok reduceRight((-> &)(1 2 3), (a, b)-> '' + b * b + a) is \143
  ok reduceRight(\123 ((+a, +b)-> a + b), 1) is 7
test 'Array.fill' !->
  {fill} = Array
  deepEqual fill((-> &)(null null null), 5), (-> &)(5 5 5)
test 'Array.find' !->
  {find} = Array
  find al = (->&)(1), (val, key, that)->
    ok @    is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  ok find((->&)(1 3 NaN, 42 {}), (is 42)) is 42
  ok find(\123, (is \2)) is \2
  ok find(\123, (is \4)) is void
test 'Array.findIndex' !->
  {findIndex} = Array
  findIndex al = (->&)(1), (val, key, that)->
    ok @    is ctx
    ok val  is 1
    ok key  is 0
    ok that is al
  , ctx = {}
  ok findIndex((->&)(1 3 NaN, 42 {}), (is 42)) is 3
  ok findIndex(\123 (is \2)) is 1
  ok findIndex(\123 (is \4)) is -1
test 'Array.keys' !->
  {keys} = Array
  ok typeof keys is \function, 'Is function'
  iter1 = keys (->&)(\q \w \e)
  ok typeof iter1 is \object, 'Iterator is object'
  ok typeof iter1.next is \function, 'Iterator has .next method'
  deepEqual iter1.next!, {value: 0, done: no}
  deepEqual iter1.next!, {value: 1, done: no}
  deepEqual iter1.next!, {value: 2, done: no}
  deepEqual iter1.next!, {value: void, done: on}
  iter2 = keys \qwe
  deepEqual iter2.next!, {value: 0, done: no}
  deepEqual iter2.next!, {value: 1, done: no}
  deepEqual iter2.next!, {value: 2, done: no}
  deepEqual iter2.next!, {value: void, done: on}
test 'Array.values' !->
  {values} = Array
  ok typeof values is \function, 'Is function'
  iter1 = values (->&)(\q \w \e)
  ok typeof iter1 is \object, 'Iterator is object'
  ok typeof iter1.next is \function, 'Iterator has .next method'
  deepEqual iter1.next!, {value: \q, done: no}
  deepEqual iter1.next!, {value: \w, done: no}
  deepEqual iter1.next!, {value: \e, done: no}
  deepEqual iter1.next!, {value: void, done: on}
  iter2 = values \qwe
  deepEqual iter2.next!, {value: \q, done: no}
  deepEqual iter2.next!, {value: \w, done: no}
  deepEqual iter2.next!, {value: \e, done: no}
  deepEqual iter2.next!, {value: void, done: on}
test 'Array.entries' !->
  {entries} = Array
  ok typeof entries is \function, 'Is function'
  iter1 = entries (->&)(\q \w \e)
  ok typeof iter1 is \object, 'Iterator is object'
  ok typeof iter1.next is \function, 'Iterator has .next method'
  deepEqual iter1.next!, {value: [0 \q], done: no}
  deepEqual iter1.next!, {value: [1 \w], done: no}
  deepEqual iter1.next!, {value: [2 \e], done: no}
  deepEqual iter1.next!, {value: void, done: on}
  iter2 = entries \qwe
  deepEqual iter2.next!, {value: [0 \q], done: no}
  deepEqual iter2.next!, {value: [1 \w], done: no}
  deepEqual iter2.next!, {value: [2 \e], done: no}
  deepEqual iter2.next!, {value: void, done: on}
test 'Array.get' !->
  {get} = Array
  ok get((->&)(1 2 3), 0)  is 1
  ok get((->&)(1 2 3), 2)  is 3
  ok get((->&)(1 2 3), 3)  is void
  ok get((->&)(1 2 3), -1) is 3
  ok get((->&)(1 2 3), -3) is 1
  ok get((->&)(1 2 3), -4) is void
  ok get(\qwe 0)  is \q
  ok get(\qwe 2)  is \e
  ok get(\qwe 3)  is void
  ok get(\qwe -1) is \e
  ok get(\qwe -3) is \q
  ok get(\qwe -4) is void
test 'Array.turn' !->
  {turn} = Array
  turn (al = (->&)(1)), (memo, val, key, that)->
    deepEqual [] memo
    ok val  is 1
    ok key  is 0
    ok that is al
  turn (al = \1), (memo, val, key, that)->
    deepEqual [] memo
    ok val is \1
    ok key is 0
    ok that ~= al
  turn (->&)(1), ->
    ok it is obj
  , obj = {}
  deepEqual [3 2 1], turn (->&)(1 2 3), ((memo, it)-> memo.unshift it)
  deepEqual [\3 \2 \1], turn \123, ((memo, it)-> memo.unshift it)
test 'Array.clone' !->
  {clone} = Array
  ok isFunction(clone), 'Is function'
  arr1 = [object1 = {q:1, w:2}, array1 = [1 2], 1 2 3]
  arr2 = clone arr1
  ok arr2 isnt arr1
  ok arr2\0 isnt object1
  ok arr2\1 isnt array1
  deepEqual arr1, arr2
test 'Array.contains' !->
  {contains} = Array
  ok isFunction(contains), 'Is function'
  args = (->&)(1 2 3 -0 NaN, o = {})
  ok contains args, 1
  ok contains args, -0
  ok !contains args, 0
  ok contains args, NaN
  ok contains args, o
  ok !contains args, 4
  ok !contains args, -0.5
  ok !contains args, {}
  str = \qwe
  ok contains str, \q
  ok !contains str, \r