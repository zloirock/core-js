{isFunction} = Object
test 'Function.inherits' !->
  {inherits} = Function
  ok isFunction inherits
  A = ->
  B = ->
  B::prop = 42
  inherits B, A
  ok new B instanceof B
  ok new B instanceof A
  ok new B!prop is 42
  ok new B!@@ is B
test 'Function.isNative' !->
  {isNative} = Function
  ok isFunction isNative
  ok isNative Object::hasOwnProperty
  ok not isNative void
  ok not isNative null
  ok not isNative 1
  ok not isNative ''
  ok not isNative no
  ok not isNative {}
  ok not isNative do -> &
  ok not isNative [1]
  ok not isNative /./
  ok not isNative ->
test 'Function::unbind' !->
  ok isFunction Function::unbind
  ok {}toString.unbind!(\qwe) is '[object String]'
  ok []reduce.unbind!(\qwe,((a, b)-> b + a), '') is 'ewq'
test 'Function::methodize' !->
  ok isFunction Function::methodize
  ok {a: 42, fn: (-> it.a)methodize!}fn! is 42
  num = new Number 42
  num.fn = ((a, b)-> a + b)methodize!
  ok num.fn(21) is 63
test 'Function::part' !->
  ok isFunction Function::part
  ok Object.isString.part(\qwe)!
  obj = a: 42
  obj.fn = (-> @a + it)part 21
  ok obj.fn! is 63
test 'Function::partial' !->
  ok isFunction Function::partial
  fn = (q, w, e, a, s, d)-> q + w + e + a + s + d
  ok \qweasd is fn.partial([,,\e,, \s, \d, \z]) \q, \w, \a, \x
  fn1 = (q, w, e, a, s, d)-> @ + q + w + e + a + s + d
  ok \zxcqweasd is fn1.partial([,, \e,, \s, \d, \z], \zxc) \q, \w, \a, \x
test 'Function::only' !->
  ok isFunction Function::only
  fn = -> & * ''
  ok fn.only(2)(\a \b \c) is \ab
  ok fn.only(2)! is ''
  fn = -> @ + & * ''
  ok fn.only(2 \x)(\a \b \c) is \xab
test 'Function::ctx' !->
  ok isFunction Function::ctx
  fn = -> @ + & * ''
  ok fn.ctx(\x)(\a \b \c) is \xabc
test 'Function::invoke' !->
  ok isFunction Function::invoke
  class C
    (@a, @b)->
  ok C.invoke! instanceof C
  deepEqual C.invoke([1 2]), new C 1 2
test 'Function::once' !->
  ok isFunction Function::once
  F = (-> Math.random!)once!
  ok 0 < F! < 1
  ok F! is F!
test 'Function::error' !->
  ok isFunction Function::error
  f = (-> 41)error -> 42
  ok f! is 41
  f = (-> ...; 41)error -> 42
  ok f! is 42
  f = (-> throw 42)error -> it
  ok f! is 42
  f = (-> ...)error (, args)-> args
  deepEqual f(1 2 3), [1 2 3]
test 'Function::before' !->
  ok isFunction Function::before
  f = (-> it + \c)before -> it.0 += \b
  ok f(\a) is \abc
test 'Function::after' !->
  ok isFunction Function::after
  f = (-> it + \b)after (result, args)-> result + args.0
  ok f(\a) is \aba
asyncTest 'Function::timeout' 5 !->
  ok isFunction Function::timeout
  ok isFunction (->
    ok val is 1
    ok it is 42
  )timeout 1 42
  val = 1
  (->
    ok no
  )timeout(1)!
  setTimeout ->
    ok on
    start!
  , 20
asyncTest 'Function::interval' 8 !->
  ok isFunction Function::interval
  var i 
  _clear = (->
    ok i < 4
    ok it is 42
    if i is 3
      _clear!
      start!
    i := i + 1
  )interval 1 42
  ok isFunction _clear
  i = 1
asyncTest 'Function::immediate' 5 !->
  ok isFunction Function::immediate
  ok isFunction (->
    ok val is 1
    ok it is 42
  )immediate 42
  val = 1
  (->
    ok no
  )immediate!()
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