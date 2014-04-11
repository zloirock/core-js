isObject = -> it is Object it
isFunction = -> typeof! it is \Function
asyncTest 'Function::timeout' 7 !->
  ok isFunction(Function::timeout), 'Is function'
  timeout = (->
    ok val is 1
    ok it is 42
  )timeout 1 42
  ok isObject timeout
  ok isFunction timeout.set
  ok isFunction timeout.clear
  val = 1
  (->
    ok no
  )timeout 1 .clear!set!clear!
  setTimeout ->
    ok on
    start!
  , 20
asyncTest 'Function::interval' 10 !->
  ok isFunction(Function::interval), 'Is function'
  var i 
  interval = (->
    ok i < 4
    ok it is 42
    if i is 3
      interval.clear!
      start!
    i := i + 1
  )interval 1 42
  ok isObject interval
  ok isFunction interval.set
  ok isFunction interval.clear
  i = 1
asyncTest 'Function::immediate' 7 !->
  ok isFunction(Function::immediate), 'Is function'
  immediate = (->
    ok val is 1
    ok it is 42
  )immediate 42
  ok isObject immediate
  ok isFunction immediate.set
  ok isFunction immediate.clear
  val = 1
  (->
    ok no
  )immediate!clear!set!clear!
  setTimeout ->
    ok on
    start!
  , 20