QUnit.module \Binding
isFunction = -> typeof! it  is \Function
DESC = /\[native code\]\s*\}\s*$/.test Object.defineProperty
{slice} = Array::
test 'Function#by' !->
  $ = _
  ok isFunction(Function::by), 'Is function'
  array = [1 2 3]
  push = array.push.by array
  ok isFunction push
  ok push(4) is 4
  deepEqual array, [1 2 3 4]
  foo = bar : (a, b, c, d)->
    ok @ is foo
    deepEqual slice.call(&), [1 2 3 4]
  bar = foo.bar.by foo, 1, $, 3 
  bar 2 4
  o = {a: \1}
  fn = (b, c)-> @a + b + c
  ok fn.by(o, \2)(\3) is \123
  ok fn.by($)(o, \2, \3) is \123
  ok fn.by($, \2)(o, \3) is \123
test 'Function#part' !->
  ok isFunction(Function::part), 'Is function'
  ok (-> typeof! it is \String)part(\qwe)!
  obj = a: 42
  obj.fn = (-> @a + it)part 21
  ok obj.fn! is 63
  $ = _
  fn = -> Array::map.call(&, String).join ' '
  part = fn.part $, \Саша, $, \шоссе, $, \сосала
  ok isFunction(part), '.part with placeholders return function'
  ok part(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  ok part(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  ok part(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'
test 'Function#only' !->
  ok isFunction(Function::only), 'Is function'
  fn = (...args)-> args.reduce (+)
  f = fn.only 2
  ok f(1 2 3) is 3
  ok f(1) is 1
  that = -> @
  o = {f: that.only 1}
  ok o.f! is o
  o = {f: that.only(1, c = {})}
  ok o.f! is c    
test '#[_]' !->
  $ = _
  ok isFunction(Object::[_]), 'Object::[_] is function'
  fn = (->
    ok @ is ctx
    ok it is 1
  )[_] \call
  fn ctx = {}, 1
  array = [1 2 3]
  push = array[_] \push
  ok isFunction push
  push(4 5)
  deepEqual array, [1 2 3 4 5]
  ok [1 2]every /\d/[_] \test
  ok ![1 \q]every /\d/[_] \test
  foo = bar : (a, b)->
    ok @ is foo
    deepEqual slice.call(&), [1 2]
  bar = foo[_] \bar
  bar 1 2 