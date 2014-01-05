{isFunction} = Object
test 'Function.series' !->
  {series} = Function
  ok isFunction series
  series [
    (next)!->
      ok isFunction next
      next.immediate 42
    (val, next)!->
      ok val is 42
      ok isFunction next
      next.immediate 1 2
    (a, b)!->
      ok a + b is 3
      start!
  ]
  stop!
  series [
    (next)!->
      ok isFunction next
      next.immediate null 42
    (val, next)!->
      ok val is 42
      ok isFunction next
      next.immediate 43 1 2
    !->
      ok no
      next.immediate 44
  ] (err, a, b)!->
    ok err is 43
    ok a + b is 3
    start!
  stop!
test 'Function.parallel' !->
  {parallel} = Function
  ok isFunction parallel
  parallel [
    (next)!-> next.immediate null 1
    (next)!-> next.immediate null 2
    (next)!-> next.immediate null 3
  ] (err, result)!->
    ok not err
    deepEqual result, [1 2 3]
    start!
  stop!
  parallel [
    (next)!-> next.immediate 42 1
    (next)!-> next.immediate null 2
  ] (err, result)!->
    ok err is 42
    deepEqual result, [1 void]
    start!
  stop!
test 'Array::asyncMap' !->
  ok isFunction Array::asyncMap
  [1 2 3]asyncMap (val, next)!->
    next.immediate null val^2
  , (err, result)!->
      ok not err
      deepEqual result, [1 4 9]
      start!
  stop!
  [1 2 3]asyncMap (val, next)!->
    next.immediate (if val is 2 => 42 else null), val^2
  , (err, result)!->
      ok err is 42
      deepEqual result, [1 4 void]
      start!
  stop!