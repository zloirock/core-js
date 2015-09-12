{module, test} = QUnit
module \core-js

isFunction = -> typeof! it  is \Function

test 'Function#part' (assert)->
  assert.ok isFunction(Function::part), 'Is function'
  assert.ok (-> typeof! it is \String)part(\qwe)!
  obj = a: 42
  obj.fn = (-> @a + it)part 21
  assert.ok obj.fn! is 63
  $ = _
  fn = -> Array::map.call(&, String).join ' '
  part = fn.part $, \Саша, $, \шоссе, $, \сосала
  assert.ok isFunction(part), '.part with placeholders return function'
  assert.ok part(\Шла \по) is 'Шла Саша по шоссе undefined сосала', '.part with placeholders: args < placeholders'
  assert.ok part(\Шла \по \и) is 'Шла Саша по шоссе и сосала', '.part with placeholders: args == placeholders'
  assert.ok part(\Шла \по \и \сушку) is 'Шла Саша по шоссе и сосала сушку', '.part with placeholders: args > placeholders'