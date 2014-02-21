{isObject} = Object
{isFunction} = Function
test 'Function.inherits' !->
  {inherits} = Function
  ok isFunction(inherits), 'Function.inherits is function'
  A = ->
  B = ->
  B::foo = 42
  inherits B, A
  ok new B instanceof B, 'new B instanceof B'
  ok new B instanceof A, 'new B instanceof A'
  ok new B!foo is 42, 'B has own proto props after inherit'
  ok new B!@@ is B, 'new B!@@ is B'
test 'Function.isFunction' !->
  {isFunction} = Function
  ok typeof isFunction is \function, 'Function.isFunction is function'
  ok isFunction(->), 'isFunction function'
  for [void, null, 1, '', no, {}, do -> &, [], /./]
    ok not isFunction(..), "not isFunction #{typeof! ..}"
test 'Function.isNative' !->
  {isNative} = Function
  ok isFunction(isNative), 'Function.isNative is function'
  ok isNative(Object::hasOwnProperty), 'isNative native function'
  for [->, void, null, 1, '', no, {}, do -> &, [], /./]
    ok not isNative(..), "not isNative #{typeof! ..}"
test 'Function::methodize' !->
  ok isFunction Function::methodize
  ok {a: 42, fn: (-> it.a)methodize!}fn! is 42
  num = new Number 42
  num.fn = ((a, b)-> a + b)methodize!
  ok num.fn(21) is 63
test 'Function::part' !->
  ok isFunction Function::part
  ok (-> typeof! it is \String)part(\qwe)!
  obj = a: 42
  obj.fn = (-> @a + it)part 21
  ok obj.fn! is 63
  $ = Function._
  fn = -> Array.map &, String .join ' '
  part = fn.part $, \Саша, $, \шоссе, $, \сосала
  ok isFunction(part), '.part with placeholders return function'
  ok part(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  ok part(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  ok part(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'
test 'Function::invoke' !->
  ok isFunction Function::invoke
  class C
    (@a, @b)->
  ok C.invoke! instanceof C
  deepEqual C.invoke([1 2]), new C 1 2
asyncTest 'Function::timeout' 7 !->
  ok isFunction Function::timeout
  timeout = (->
    ok val is 1
    ok it is 42
  )timeout 1 42 .run!
  ok isObject timeout
  ok isFunction timeout.run
  ok isFunction timeout.stop
  val = 1
  (->
    ok no
  )timeout 1 .run!stop!
  setTimeout ->
    ok on
    start!
  , 20
asyncTest 'Function::interval' 10 !->
  ok isFunction Function::interval
  var i 
  interval = (->
    ok i < 4
    ok it is 42
    if i is 3
      interval.stop!
      start!
    i := i + 1
  )interval 1 42 .run!
  ok isObject interval
  ok isFunction interval.run
  ok isFunction interval.stop
  i = 1
asyncTest 'Function::immediate' 7 !->
  ok isFunction Function::immediate
  immediate = (->
    ok val is 1
    ok it is 42
  )immediate 42 .run!
  ok isObject immediate
  ok isFunction immediate.run
  ok isFunction immediate.stop
  val = 1
  (->
    ok no
  )immediate!run!stop!
  setTimeout ->
    ok on
    start!
  , 20
test 'Function::inherits' !->
  ok isFunction Function::inherits
  A = ->
  B = ->
  B::prop = 42
  B.inherits A
  ok new B instanceof B
  ok new B instanceof A
  ok new B!prop is 42
  ok new B!@@ is B