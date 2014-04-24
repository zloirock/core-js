isFunction = -> typeof! it  is \Function
test 'Function::by' !->
  ok isFunction(Function::by), 'Is function'
test 'Function::part' !->
  ok isFunction(Function::part), 'Is function'
  ok (-> typeof! it is \String)part(\qwe)!
  obj = a: 42
  obj.fn = (-> @a + it)part 21
  ok obj.fn! is 63
  $ = Function._
  fn = -> Array::map.call(&, String).join ' '
  part = fn.part $, \Саша, $, \шоссе, $, \сосала
  ok isFunction(part), '.part with placeholders return function'
  ok part(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  ok part(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  ok part(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'
test '::tie' !->
  ok isFunction(Function::tie), 'Function::tie is function'
  ok isFunction(Array::tie), 'Array::tie is function'
  ok isFunction(RegExp::tie), 'RegExp::tie is function'
  ok \tie not of Object::, 'tie not in Object:: before useTie call'
  _.useTie!
  ok isFunction(Object::tie), 'Object::tie is function'
  delete Object::tie
test 'Object.tie' ->
  {tie} = Object
  ok isFunction(tie), 'Is function'
  array = [1 2 3]
  push = tie array, \push
  ok isFunction push
  ok push(4) is 4
  deepEqual array, [1 2 3 4]
test 'Function::methodize' !->
  ok isFunction(Function::methodize), 'Is function'
  ok {a: 42, fn: (-> it.a)methodize!}fn! is 42
  num = new Number 42
  num.fn = ((a, b)-> a + b)methodize!
  ok num.fn(21) is 63