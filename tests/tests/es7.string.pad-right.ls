'use strict';
{module, test} = QUnit
module \ES7

test 'String#padRight' (assert)->
  assert.isFunction String::padRight
  assert.arity String::padRight, 1
  assert.name String::padRight, \padRight
  assert.looksNative String::padRight
  assert.strictEqual 'abc'padRight(5), 'abc  '
  assert.strictEqual 'abc'padRight(4, \de), \abcd
  assert.strictEqual 'abc'padRight!,  \abc
  assert.strictEqual 'abc'padRight(5 '_'), 'abc__'
  assert.strictEqual ''padRight(0), ''
  assert.strictEqual 'foo'padRight(1), \foo
  if !(-> @)!
    assert.throws (-> String::padRight.call null, 0), TypeError
    assert.throws (-> String::padRight.call void, 0), TypeError