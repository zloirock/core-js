{module, test} = QUnit
module \ES

test 'Object.defineProperties' (assert)!->
  {defineProperties} = core.Object
  assert.isFunction defineProperties
  assert.arity defineProperties, 2
  assert.ok (rez = defineProperties src = {}, q: {value: 42}, w: value: 33) is src
  assert.ok rez.q is 42 and rez.w is 33