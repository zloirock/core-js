'use strict';
{module, test} = QUnit
module \ES7

test 'String#padLeft' (assert)->
  assert.ok typeof! String::padLeft is \Function, 'is function'
  assert.strictEqual String::padLeft.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::padLeft), 'looks like native'
  assert.strictEqual String::padLeft.name, \padLeft, 'name is "padLeft"'
  assert.strictEqual 'abc'padLeft(5), '  abc'
  assert.strictEqual 'abc'padLeft(4 \de), \eabc
  assert.strictEqual 'abc'padLeft!,  \abc
  assert.strictEqual 'abc'padLeft(5 '_'), '__abc'
  assert.strictEqual ''padLeft(0), ''
  assert.strictEqual 'foo'padLeft(1), \foo
  if !(-> @)!
    assert.throws (-> String::padLeft.call null, 0), TypeError
    assert.throws (-> String::padLeft.call void, 0), TypeError