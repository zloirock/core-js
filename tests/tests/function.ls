isFunction = -> typeof! it  is \Function
test 'Function.isFunction' !->
  {isFunction} = Function
  ok typeof isFunction is \function, 'Is function'
  ok isFunction(->), 'isFunction function'
  for [void, null, 1, '', no, {}, do -> &, [], /./]
    ok not isFunction(..), "not isFunction #{typeof! ..}"
test 'Function.isNative' !->
  {isNative} = Function
  ok isFunction(isNative), 'Is function'
  ok isNative(Object::hasOwnProperty), 'isNative native function'
  for [->, void, null, 1, '', no, {}, do -> &, [], /./]
    ok not isNative(..), "not isNative #{typeof! ..}"
test 'Function::construct' !->
  ok isFunction(Function::construct), 'Is function'
  class C
    (@a, @b)->
  ok C.construct([]) instanceof C
  deepEqual C.construct([1 2]), new C 1 2