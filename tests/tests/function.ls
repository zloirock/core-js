isFunction = -> typeof! it  is \Function
test 'Function::construct' !->
  ok isFunction(Function::construct), 'Is function'
  class C
    (@a, @b)->
  ok C.construct([]) instanceof C
  deepEqual C.construct([1 2]), new C 1 2