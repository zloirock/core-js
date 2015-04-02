QUnit.module 'core-js binding'
isFunction = -> typeof! it  is \Function
{map, every, reduce} = core.Array
test 'Function#part' !->
  {part} = core.Function
  $ = core._
  ok isFunction(part), 'Is function'
  ok part((-> typeof! it is \String), \qwe)!
  obj = a: 42
  obj.fn = part (-> @a + it), 21
  ok obj.fn! is 63
  fn = -> map(&, String).join ' '
  p = part fn, $, \Саша, $, \шоссе, $, \сосала
  ok isFunction(p), '.part with placeholders return function'
  ok p(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  ok p(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  ok p(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'
test 'Function#only' !->
  {only} = core.Function
  ok isFunction(only), 'Is function'
  fn = (...args)-> reduce args, (+)
  f = only fn, 2
  ok f(1 2 3) is 3
  ok f(1) is 1
  that = -> @
  o = {f: only that, 1}
  ok o.f! is o
  o = {f: only that, 1, c = {}}
  ok o.f! is c    
test '#[_]' !->
  $ = core._
  ok isFunction(Object::[$]), 'Object::[_] is function'
  fn = (->
    ok @ is ctx
    ok it is 1
  )[$] \call
  fn ctx = {}, 1
  array = [1 2 3]
  push = array[$] \push
  ok isFunction push
  push(4 5)
  deepEqual array, [1 2 3 4 5]
  ok every [1 2], /\d/[$] \test
  ok !every [1 \q], /\d/[$] \test
  foo = bar : (a, b)->
    ok @ is foo
    deepEqual Array::slice.call(&), [1 2]
  bar = foo[$] \bar
  bar 1 2 