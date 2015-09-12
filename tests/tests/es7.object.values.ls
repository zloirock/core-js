{module, test} = QUnit
module \ES7

test 'Object.values' (assert)->
  {values, create, assign} = Object
  assert.ok typeof! values is \Function, 'Is function'
  assert.ok /native code/.test(values), 'looks like native'
  assert.strictEqual values.length, 1, 'arity is 1'
  assert.strictEqual values.name, \values, 'name is "values"'
  assert.deepEqual values({q:1, w:2, e:3}), [1 2 3]
  assert.deepEqual values(new String \qwe), [\q \w \e]
  assert.deepEqual values(assign create({q:1, w:2, e:3}), {a:4, s:5, d:6}), [4 5 6]