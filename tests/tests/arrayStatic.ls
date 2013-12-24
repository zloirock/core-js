{isFunction} = Object
test 'Array.concat' ->
  {concat} = Array
  ok isFunction concat
  arr = [1 2 3]
  ok arr isnt result = Array.concat arr, [4 5 6]
  deepEqual result, [1 2 3 4 5 6]
  arr = <[q w e]>
  ok arr isnt result = Array.concat arr, <[a s d]>
  deepEqual result, <[q w e a s d]>
test 'Array.join' ->
  {join} = Array
  ok isFunction join
  equal join(\123, \|), \1|2|3
  equal join((-> &)(3 2 1), \|), \3|2|1
test 'Array.pop' ->
  {pop} = Array
  ok isFunction pop
  equal pop(args = (-> &)(1 2 3)), 3
  deepEqual args, (-> &)(1 2)
test 'Array.push' ->
  {push} = Array
  ok isFunction push
  push args = (-> &)(1 2 3), 4 5
  deepEqual args, (-> &)(1 2 3 4 5)
test 'Array.reverse' ->
  {reverse} = Array
  ok isFunction reverse
  deepEqual reverse((-> &)(1 2 3)), (-> &)(3 2 1)
test 'Array.shift' ->
  {shift} = Array
  ok isFunction shift
  equal shift(args = (-> &)(1 2 3)), 1
  deepEqual args, (-> &)(2 3)
test 'Array.unshift' ->
  {unshift} = Array
  ok isFunction unshift
  unshift args = (-> &)(1 2 3), 4 5
  deepEqual args, (-> &)(4 5 1 2 3)
test 'Array.slice' ->
  {slice} = Array
  ok isFunction slice
  deepEqual slice(\123), <[1 2 3]>
  deepEqual slice(\123 1), <[2 3]>
  deepEqual slice(\123 1 2), <[2]>
  deepEqual slice(\123 1 -1), <[2]>
  deepEqual slice((-> &)(1 2 3)), [1 2 3]
  deepEqual slice((-> &)(1 2 3), 1), [2 3]
  deepEqual slice((-> &)(1 2 3), 1, 2), [2]
  deepEqual slice((-> &)(1 2 3), 1, -1), [2]
test 'Array.splice' ->
  {splice} = Array
  ok isFunction splice
  splice args = (-> &)(1 2 3), 1 0 4 5
  deepEqual args, (-> &)(1 4 5 2 3)
  splice args = (-> &)(1 2 3), 1 1 4
  deepEqual args, (-> &)(1 4 3)
  splice args = (-> &)(1 2 3), 1 1
  deepEqual args, (-> &)(1 3)
test 'Array.sort' ->
  {sort} = Array
  ok isFunction sort
  deepEqual sort((-> &)(2 1 3)), (-> &)(1 2 3)
  deepEqual sort((-> &)(11 2 3)), (-> &)(11 2 3)
  deepEqual sort((-> &)(11 2 3), (a, b)-> a - b), (-> &)(2 3 11)
test 'Array.indexOf' ->
  {indexOf} = Array
  ok isFunction indexOf
  equal indexOf(\111 \1), 0
  equal indexOf(\123 \1 1), -1
  equal indexOf(\123 \2 1), 1
  equal indexOf((-> &)(1 1 1), 1), 0
  equal indexOf((-> &)(1 2 3), 1 1), -1
  equal indexOf((-> &)(1 2 3), 2 1), 1
test 'Array.lastIndexOf' ->
  {lastIndexOf} = Array
  ok isFunction lastIndexOf
  equal lastIndexOf(\111 \1), 2
  equal lastIndexOf(\123 \3 1), -1
  equal lastIndexOf(\123 \2 1), 1
  equal lastIndexOf((-> &)(1 1 1), 1), 2
  equal lastIndexOf((-> &)(1 2 3), 3 1), -1
  equal lastIndexOf((-> &)(1 2 3), 2 1), 1
test 'Array.every' ->
  {every} = Array
  ok isFunction every
  every al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  ok every  \123 Object.isString
  ok every  \123 -> &1 < 3
  ok !every \123 Object.isNumber
  ok !every \123 -> &1 < 2
  ok every  \123 -> &2 ~= \123
  ok every  (->&)(1,2,3), Object.isNumber
test 'Array.some' ->
  {some} = Array
  ok isFunction some
  some al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  ok some  \123 Object.isString
  ok some  \123 -> &1 > 1
  ok !some \123 Object.isNumber
  ok !some \123 -> &1 > 3
  ok some  \123 -> &2 ~= \123
  ok some  (-> &)(1 2 3), Object.isNumber
test 'Array.forEach' ->
  {forEach} = Array
  ok isFunction forEach
  forEach al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  val = ''
  forEach \123 (v, k, t)-> val += v + k + t
  equal val, \101232112332123
  val = ''
  forEach (-> &)(1 2 3), (v, k, t)-> val += v + k + t\2
  equal val, \468
  val = ''
  forEach \123 ((v, k, t)-> val += v + k + t + @), 1
  equal val, \101231211231321231
test 'Array.map' ->
  {map} = Array
  ok isFunction map
  map al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  deepEqual map(\123 (^2)), [1 4 9]
  deepEqual map((-> &)(1 2 3), (^2)), [1 4 9]
test 'Array.filter' ->
  {filter} = Array
  ok isFunction filter
  filter al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  deepEqual filter(\123, -> it > 1), <[2 3]>
  deepEqual filter((-> &)(1 2 3), -> it < 3), [1,2]
  deepEqual filter(\123 -> &1 != 1), <[1 3]>
test 'Array.reduce' ->
  {reduce} = Array
  ok isFunction reduce
  reduce al = (->&)(1), ((memo, val, key, that)->
    ok memo is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  reduce al = (->&)(1 2), ((memo)->
    ok memo is 1
  )
  equal reduce(\123 ((+a, +b)-> a + b)), 6
  equal reduce((-> &)(1 2 3), (a, b)-> '' + b * b + a), \941
  equal reduce(\123 ((+a, +b)-> a + b), 1), 7
test 'Array.reduceRight' ->
  {reduceRight} = Array
  ok isFunction reduceRight
  reduceRight al = (->&)(1), ((memo, val, key, that)->
    ok memo is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  reduceRight al = (->&)(1 2), ((memo)->
    ok memo is 2
  )
  equal reduceRight(\123 ((+a, +b)-> a + b)), 6
  equal reduceRight((-> &)(1 2 3), (a, b)-> '' + b * b + a), \143
  equal reduceRight(\123 ((+a, +b)-> a + b), 1), 7
test 'Array.find' ->
  {find} = Array
  ok isFunction find
  find al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  ok find((->&)(1 3 NaN, 42 {}), (is 42)) is 42
  ok find(\123, (is \2)) is \2
  ok find(\123, (is \4)) is void
test 'Array.findIndex' ->
  {findIndex} = Array
  ok isFunction findIndex
  findIndex al = (->&)(1), ((val, key, that)->
    ok @ is ctx
    ok val is 1
    ok key is 0
    ok that is al
  ), ctx = {}
  ok findIndex((->&)(1 3 NaN, 42 {}), (is 42)) is 3
  ok findIndex(\123, (is \2)) is 1
  ok findIndex(\123, (is \4)) is -1
test 'Array.at' ->
  {at} = Array
  ok isFunction at
  ok at((->&)(1 2 3), 0) is 1
  ok at((->&)(1 2 3), 2) is 3
  ok at((->&)(1 2 3), 3) is void
  ok at((->&)(1 2 3), -1) is 3
  ok at((->&)(1 2 3), -3) is 1
  ok at((->&)(1 2 3), -4) is void
  ok at(\123 0) is \1
  ok at(\123 2) is \3
  ok at(\123 3) is void
  ok at(\123 -1) is \3
  ok at(\123 -3) is \1
  ok at(\123 -4) is void
test 'Array.props' ->
  {props} = Array
  ok isFunction props
  deepEqual props((->&)(\1 \22  3), \length), [1 2 void]
  deepEqual props(\123 \length), [1 1 1]
test 'Array.reduceTo' ->
  {reduceTo} = Array
  ok isFunction reduceTo
  reduceTo (al = (->&)(1)), (val, key, that)->
    deepEqual {} @
    ok val is 1
    ok key is 0
    ok that is al
  reduceTo (al = \1), (val, key, that)->
    deepEqual {} @
    ok val is \1
    ok key is 0
    ok that ~= al
  reduceTo (->&)(1), (->
    ok @ is obj
  ), obj = {}
  deepEqual [3 2 1], reduceTo (->&)(1 2 3), (@unshift <|), []
  deepEqual [\3 \2 \1], reduceTo \123 (@unshift <|), []
test 'Array.indexSame' ->
  {indexSame} = Array
  ok isFunction indexSame
  ok indexSame((->&)(1 2 3 4 3 2 1), 3) is 2
  ok indexSame((->&)(1, NaN, 3), NaN) is 1
  ok indexSame((->&)(0, -0, 42), -0) is 1
  ok indexSame(\1234321, \3) is 2
test 'Array.merge' ->
  {merge} = Array
  ok isFunction merge
  arr = (->&)(1 2 3)
  ok arr is merge arr, (->&)(4 5 6)
  deepEqual arr, (->&)(1 2 3 4 5 6)
test 'Array.sum' ->
  {sum} = Array
  ok isFunction sum
  equal sum(\123), 6
  equal sum(\123 \length), 3
  equal sum((-> &)(1 2 3)), 6
test 'Array.avg' ->
  {avg} = Array
  ok isFunction avg
  equal avg(\123), 2
  equal avg(\123 \length), 1
  equal avg((-> &)(1 2 3)), 2
test 'Array.min' ->
  {min} = Array
  ok isFunction min
  ok min((->&)(3 2 1 2 3)) is 1
  ok min(\123 \length) is 1
test 'Array.max' ->
  {max} = Array
  ok isFunction max
  ok max((->&)(1 2 3 2 1)) is 3
  ok max(\123 \length) is 1
test 'Array.unique' ->
  {unique} = Array
  ok isFunction unique
  deepEqual unique(\12321), <[1 2 3]>
  deepEqual unique((-> &)(1 2 3 2 1)), [1 2 3]
test 'Array.cross' ->
  {cross} = Array
  ok isFunction cross
  deepEqual cross((->&)(1 2 3 2 1), (->&)(2 5 7 1)), [1 2]
  deepEqual cross((->&)(\1 \2 \3 \2 \1), (->&)(\2 \5 \7 \1)), <[1 2]>