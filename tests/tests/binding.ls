isFunction = -> typeof! it  is \Function
{slice} = Array::
test 'Function::by' !->
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
  ok fn.by(o, \2)(\3), \123
  ok fn.by($)(o, \2, \3), \123
  ok fn.by($, \2)(o, \3), \123
test 'Function::part' !->
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
test 'Object.tie' ->
  {tie} = Object
  $ = _
  ok isFunction(tie), 'Is function'
  array = [1 2 3]
  push = tie array, \push
  ok isFunction push
  ok push(4) is 4
  deepEqual array, [1 2 3 4]
  foo = bar : (a, b, c, d)->
    ok @ is foo
    deepEqual slice.call(&), [1 2 3 4]
  bar = tie foo, \bar 1, $, 3 
  bar 2 4
test '::tie' !->
  $ = _
  ok isFunction(Function::tie), 'Function::tie is function'
  fn = ((a, b, c, d)->
    ok @ is ctx
    deepEqual slice.call(&), [1 2 3 4]
  ).tie \call ctx = {}, 1, $, 3
  fn 2 4
  ok isFunction(Array::tie), 'Array::tie is function'
  array = [1 2 3]
  push = array.tie \push 4, $, 6
  ok isFunction push
  push(5 7)
  deepEqual array, [1 2 3 4 5 6 7]
  ok isFunction(RegExp::tie), 'RegExp::tie is function'
  ok [1 2]every /\d/tie \test
  ok ![1 \q]every /\d/tie \test
  ok \tie not of Object::, 'tie not in Object:: before useTie call'
  C.useTie!
  ok isFunction(Object::tie), 'Object::tie is function'
  foo = bar : (a, b, c, d)->
    ok @ is foo
    deepEqual slice.call(&), [1 2 3 4]
  bar = foo.tie \bar 1, $, 3 
  bar 2 4
  delete Object::tie
test 'Function::methodize' !->
  ok isFunction(Function::methodize), 'Is function'
  ok {a: 42, fn: (-> it.a)methodize!}fn! is 42
  num = new Number 42
  num.fn = ((a, b)-> a + b)methodize!
  ok num.fn(21) is 63