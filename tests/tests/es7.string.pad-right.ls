'use strict';
{module, test} = QUnit
module \ES7

test 'String#padRight' (assert)->
  assert.ok typeof! String::padRight is \Function, 'is function'
  assert.strictEqual String::padRight.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::padRight), 'looks like native'
  assert.strictEqual String::padRight.name, \padRight, 'name is "padRight"'
  assert.strictEqual 'abc'padRight(5), 'abc  '
  assert.strictEqual 'abc'padRight(4, \de), \abcd
  assert.strictEqual 'abc'padRight!,  \abc
  assert.strictEqual 'abc'padRight(5 '_'), 'abc__'
  assert.strictEqual ''padRight(0), ''
  assert.strictEqual 'foo'padRight(1), \foo
  if !(-> @)!
    assert.throws (-> String::padRight.call null, 0), TypeError
    assert.throws (-> String::padRight.call void, 0), TypeError