'use strict'
{module, test} = QUnit
module \ES6

test 'String#startsWith' (assert)->
  assert.ok typeof! String::startsWith is \Function, 'Is function'
  assert.strictEqual String::startsWith.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::startsWith), 'looks like native'
  assert.strictEqual String::startsWith.name, \startsWith, 'name is "startsWith"'
  assert.ok 'undefined'startsWith!
  assert.ok not 'undefined'startsWith null
  assert.ok 'abc'startsWith ''
  assert.ok 'abc'startsWith 'a'
  assert.ok 'abc'startsWith 'ab'
  assert.ok not 'abc'startsWith 'bc'
  assert.ok 'abc'startsWith '' NaN
  assert.ok 'abc'startsWith \a -1
  assert.ok not 'abc'startsWith \a 1
  assert.ok not 'abc'startsWith \a Infinity
  assert.ok 'abc'startsWith \b on
  assert.ok 'abc'startsWith \a \x
  if !(-> @)!
    assert.throws (-> String::startsWith.call null, '.'), TypeError
    assert.throws (-> String::startsWith.call void, '.'), TypeError
  assert.throws (-> 'qwe'startsWith /./), TypeError