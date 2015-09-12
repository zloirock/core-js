'use strict'
{module, test} = QUnit
module \ES6

test 'String#endsWith' (assert)->
  assert.ok typeof! String::endsWith is \Function, 'is function'
  assert.strictEqual String::endsWith.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::endsWith), 'looks like native'
  assert.strictEqual String::endsWith.name, \endsWith, 'name is "endsWith"'
  assert.ok 'undefined'endsWith!
  assert.ok not 'undefined'endsWith null
  assert.ok 'abc'endsWith ''
  assert.ok 'abc'endsWith 'c'
  assert.ok 'abc'endsWith 'bc'
  assert.ok not 'abc'endsWith 'ab'
  assert.ok 'abc'endsWith '' NaN
  assert.ok not 'abc'endsWith \c -1
  assert.ok 'abc'endsWith \a 1
  assert.ok 'abc'endsWith \c Infinity
  assert.ok 'abc'endsWith \a on
  assert.ok not 'abc'endsWith \c \x
  assert.ok not 'abc'endsWith \a \x
  if !(-> @)!
    assert.throws (-> String::endsWith.call null, '.'), TypeError
    assert.throws (-> String::endsWith.call void, '.'), TypeError
  assert.throws (-> 'qwe'endsWith /./), TypeError