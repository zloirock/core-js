{module, test} = QUnit
module 'core-js'

{map, every, reduce} = core.Array

test 'Function#part' (assert)!->
  {part} = core.Function
  $ = core._
  assert.isFunction part
  assert.ok part((-> typeof! it is \String), \qwe)!
  obj = a: 42
  obj.fn = part (-> @a + it), 21
  assert.ok obj.fn! is 63
  fn = -> map(&, String).join ' '
  p = part fn, $, \Саша, $, \шоссе, $, \сосала
  assert.isFunction p, '.part with placeholders return function'
  assert.ok p(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  assert.ok p(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  assert.ok p(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'