'use strict'
{module, test} = QUnit
module \ES6

test 'String#repeat' (assert)->
  assert.ok typeof! String::repeat is \Function, 'Is function'
  assert.strictEqual String::repeat.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::repeat), 'looks like native'
  assert.strictEqual String::repeat.name, \repeat, 'name is "repeat"'
  assert.strictEqual 'qwe'repeat(3), \qweqweqwe
  assert.strictEqual 'qwe'repeat(2.5), \qweqwe
  assert.throws (-> 'qwe'repeat -1), RangeError
  assert.throws (-> 'qwe'repeat Infinity), RangeError
  if !(-> @)!
    assert.throws (-> String::repeat.call null, 1), TypeError
    assert.throws (-> String::repeat.call void, 1), TypeError