{module, test} = QUnit
module \ES5

test 'Object.defineProperties' (assert)->
  {defineProperties} = Object
  assert.isFunction defineProperties
  assert.arity defineProperties, 2
  assert.name defineProperties, \defineProperties
  assert.looksNative defineProperties
  assert.ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  assert.ok rez.q is 42 and rez.w is 33