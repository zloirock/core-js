{module, test} = QUnit
module 'Mozilla JavaScript Array statics'

{slice} = Array::

test 'are functions' (assert)->
  for <[concat join pop push reverse shift slice sort splice unshift indexOf lastIndexOf every some forEach map filter reduce reduceRight copyWithin fill find findIndex keys values entries includes]>
    assert.isFunction Array[..], "Array.#{..} is function"

test '.join' (assert)->
  {join} = Array
  assert.ok join(\123) is '1,2,3'
  assert.ok join(\123, \|) is \1|2|3
  assert.ok join((-> &)(3 2 1), \|) is \3|2|1

test '.pop' (assert)->
  {pop} = Array
  assert.ok pop(args = {0: 1, 1: 2, 2: 3, length: 3}) is 3
  assert.deepEqual args, {0: 1, 1: 2, length: 2}

test '.push' (assert)->
  {push} = Array
  push args = (-> &)(1 2 3), 4 5
  # don't enum arguments props in ie 8-
  assert.deepEqual slice.call(args), [1 2 3 4 5]

test '.reverse' (assert)->
  {reverse} = Array
  assert.deepEqual reverse((-> &)(1 2 3)), (-> &)(3 2 1)

test '.shift' (assert)->
  {shift} = Array
  assert.ok shift(args = {0: 1, 1: 2, 2: 3, length: 3}) is 1
  assert.deepEqual args, {0: 2, 1: 3, length: 2}

test '.unshift' (assert)->
  {unshift} = Array
  unshift args = (-> &)(1 2 3), 4 5
  # don't enum arguments props in ie 8-
  assert.deepEqual slice.call(args), [4 5 1 2 3]

test '.slice' (assert)->
  {slice} = Array
  assert.deepEqual slice(\123), <[1 2 3]>
  assert.deepEqual slice(\123 1), <[2 3]>
  assert.deepEqual slice(\123 1 2), <[2]>
  assert.deepEqual slice(\123 1 -1), <[2]>
  assert.deepEqual slice((-> &)(1 2 3)), [1 2 3]
  assert.deepEqual slice((-> &)(1 2 3), 1), [2 3]
  assert.deepEqual slice((-> &)(1 2 3), 1, 2), [2]
  assert.deepEqual slice((-> &)(1 2 3), 1, -1), [2]

test '.splice' (assert)->
  {splice} = Array
  splice args = (-> &)(1 2 3), 1 0 4 5
  # don't enum arguments props in ie 8-
  assert.deepEqual slice.call(args), [1 4 5 2 3]
  splice args = (-> &)(1 2 3), 1 1 4
  assert.deepEqual slice.call(args), [1 4 3]
  splice args = (-> &)(1 2 3), 1 1
  assert.deepEqual slice.call(args), [1 3]

test '.sort' (assert)->
  {sort} = Array
  assert.deepEqual sort((-> &)(2 1 3)), (-> &)(1 2 3)
  assert.deepEqual sort((-> &)(11 2 3)), (-> &)(11 2 3)
  assert.deepEqual sort((-> &)(11 2 3), (a, b)-> a - b), (-> &)(2 3 11)

test '.indexOf' (assert)->
  {indexOf} = Array
  assert.ok indexOf(\111 \1) is 0
  assert.ok indexOf(\123 \1 1) is -1
  assert.ok indexOf(\123 \2 1) is 1
  assert.ok indexOf((-> &)(1 1 1), 1) is 0
  assert.ok indexOf((-> &)(1 2 3), 1 1) is -1
  assert.ok indexOf((-> &)(1 2 3), 2 1) is 1

test '.lastIndexOf' (assert)->
  {lastIndexOf} = Array
  assert.ok lastIndexOf(\111 \1) is 2
  assert.ok lastIndexOf(\123 \3 1) is -1
  assert.ok lastIndexOf(\123 \2 1) is 1
  assert.ok lastIndexOf((-> &)(1 1 1), 1) is 2
  assert.ok lastIndexOf((-> &)(1 2 3), 3 1) is -1
  assert.ok lastIndexOf((-> &)(1 2 3), 2 1) is 1

test '.every' (assert)->
  {every} = Array
  every al = (->&)(1), (val, key, that)->
    assert.ok @ is ctx
    assert.ok val is 1
    assert.ok key is 0
    assert.ok that is al
  , ctx = {}
  assert.ok every  \123 -> typeof! it is \String
  assert.ok every  \123 -> &1 < 3
  assert.ok not every \123 -> typeof! it is \Number
  assert.ok not every \123 -> &1 < 2
  assert.ok every  \123 -> &2 ~= \123
  assert.ok every  (->&)(1,2,3), -> typeof! it is \Number

test '.some' (assert)->
  {some} = Array
  some al = (->&)(1), (val, key, that)->
    assert.ok @ is ctx
    assert.ok val is 1
    assert.ok key is 0
    assert.ok that is al
  , ctx = {}
  assert.ok some  \123 -> typeof! it is \String
  assert.ok some  \123 -> &1 > 1
  assert.ok not some \123 -> typeof! it is \Number
  assert.ok not some \123 -> &1 > 3
  assert.ok some  \123 -> &2 ~= \123
  assert.ok some  (-> &)(1 2 3), -> typeof! it is \Number

test '.forEach' (assert)->
  {forEach} = Array
  forEach al = (->&)(1), (val, key, that)!->
    assert.ok @    is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  val = ''
  forEach \123 (v, k, t)!-> val += v + k + t
  assert.ok val is \101232112332123
  val = ''
  forEach (-> &)(1 2 3), (v, k, t)!-> val += v + k + t\2
  assert.ok val is \468
  val = ''
  forEach \123 ((v, k, t)!-> val += v + k + t + @), 1
  assert.ok val is \101231211231321231

test '.map' (assert)->
  {map} = Array
  map al = (->&)(1), (val, key, that)->
    assert.ok @    is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  assert.deepEqual map(\123 (^2)), [1 4 9]
  assert.deepEqual map((-> &)(1 2 3), (^2)), [1 4 9]

test '.filter' (assert)->
  {filter} = Array
  filter al = (->&)(1), (val, key, that)->
    assert.ok @    is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  assert.deepEqual filter(\123, -> it > 1), <[2 3]>
  assert.deepEqual filter((-> &)(1 2 3), -> it < 3), [1,2]
  assert.deepEqual filter(\123 -> &1 != 1), <[1 3]>

test '.reduce' (assert)->
  {reduce} = Array
  reduce al = (->&)(1), (memo, val, key, that)->
    assert.ok memo is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  reduce al = (->&)(1 2), (memo)->
    assert.ok memo is 1
  assert.ok reduce(\123 ((+a, +b)-> a + b)) is 6
  assert.ok reduce((-> &)(1 2 3), (a, b)-> '' + b * b + a) is \941
  assert.ok reduce(\123 ((+a, +b)-> a + b), 1) is 7

test '.reduceRight' (assert)->
  {reduceRight} = Array
  reduceRight al = (->&)(1), (memo, val, key, that)->
    assert.ok memo is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  reduceRight al = (->&)(1 2), (memo)->
    assert.ok memo is 2
  assert.ok reduceRight(\123 ((+a, +b)-> a + b)) is 6
  assert.ok reduceRight((-> &)(1 2 3), (a, b)-> '' + b * b + a) is \143
  assert.ok reduceRight(\123 ((+a, +b)-> a + b), 1) is 7

test '.copyWithin' (assert)->
  {copyWithin} = Array
  assert.ok copyWithin(a = (->&)(1 2 3), 0) is a
  assert.deepEqual copyWithin((->&)(1 2 3), -2), (->&)(1 1 2)
  assert.deepEqual copyWithin((->&)(1 2 3), 0 1), (->&)(2 3 3)
  assert.deepEqual copyWithin((->&)(1 2 3), 0 1 2), (->&)(2 2 3)

test '.fill' (assert)->
  {fill} = Array
  assert.ok fill(a = (->&)(1 2 3), 0) is a
  assert.deepEqual fill(Array(3), 5), [5 5 5]

test '.find' (assert)->
  {find} = Array
  find al = (->&)(1), (val, key, that)->
    assert.ok @    is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  assert.ok find((->&)(1 3 NaN, 42 {}), (is 42)) is 42
  assert.ok find(\123, (is \2)) is \2
  assert.ok find(\123, (is \4)) is void

test '.findIndex' (assert)->
  {findIndex} = Array
  findIndex al = (->&)(1), (val, key, that)->
    assert.ok @    is ctx
    assert.ok val  is 1
    assert.ok key  is 0
    assert.ok that is al
  , ctx = {}
  assert.ok findIndex((->&)(1 3 NaN, 42 {}), (is 42)) is 3
  assert.ok findIndex(\123 (is \2)) is 1
  assert.ok findIndex(\123 (is \4)) is -1

test '.keys' (assert)->
  {keys} = Array
  iter1 = keys (->&)(\q \w \e)
  assert.ok typeof iter1 is \object, 'Iterator is object'
  assert.ok typeof iter1.next is \function, 'Iterator has .next method'
  assert.deepEqual iter1.next!, {value: 0, done: no}
  assert.deepEqual iter1.next!, {value: 1, done: no}
  assert.deepEqual iter1.next!, {value: 2, done: no}
  assert.deepEqual iter1.next!, {value: void, done: on}
  iter2 = keys \qwe
  assert.deepEqual iter2.next!, {value: 0, done: no}
  assert.deepEqual iter2.next!, {value: 1, done: no}
  assert.deepEqual iter2.next!, {value: 2, done: no}
  assert.deepEqual iter2.next!, {value: void, done: on}

test '.values' (assert)->
  {values} = Array
  iter1 = values (->&)(\q \w \e)
  assert.ok typeof iter1 is \object, 'Iterator is object'
  assert.ok typeof iter1.next is \function, 'Iterator has .next method'
  assert.deepEqual iter1.next!, {value: \q, done: no}
  assert.deepEqual iter1.next!, {value: \w, done: no}
  assert.deepEqual iter1.next!, {value: \e, done: no}
  assert.deepEqual iter1.next!, {value: void, done: on}
  iter2 = values \qwe
  assert.deepEqual iter2.next!, {value: \q, done: no}
  assert.deepEqual iter2.next!, {value: \w, done: no}
  assert.deepEqual iter2.next!, {value: \e, done: no}
  assert.deepEqual iter2.next!, {value: void, done: on}

test '.entries' (assert)->
  {entries} = Array
  iter1 = entries (->&)(\q \w \e)
  assert.ok typeof iter1 is \object, 'Iterator is object'
  assert.ok typeof iter1.next is \function, 'Iterator has .next method'
  assert.deepEqual iter1.next!, {value: [0 \q], done: no}
  assert.deepEqual iter1.next!, {value: [1 \w], done: no}
  assert.deepEqual iter1.next!, {value: [2 \e], done: no}
  assert.deepEqual iter1.next!, {value: void, done: on}
  iter2 = entries \qwe
  assert.deepEqual iter2.next!, {value: [0 \q], done: no}
  assert.deepEqual iter2.next!, {value: [1 \w], done: no}
  assert.deepEqual iter2.next!, {value: [2 \e], done: no}
  assert.deepEqual iter2.next!, {value: void, done: on}

test '.includes' (assert)->
  {includes} = Array
  args = (->&)(1 2 3 -0 NaN, o = {})
  assert.ok includes args, 1
  assert.ok includes args, -0
  assert.ok includes args, 0
  assert.ok includes args, NaN
  assert.ok includes args, o
  assert.ok !includes args, 4
  assert.ok !includes args, -0.5
  assert.ok !includes args, {}
  str = \qwe
  assert.ok includes str, \q
  assert.ok !includes str, \r