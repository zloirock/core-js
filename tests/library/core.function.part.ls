QUnit.module 'core-js'
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