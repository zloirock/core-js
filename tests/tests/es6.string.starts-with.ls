'use strict'
{module, test} = QUnit
module \ES6

test 'String#startsWith' (assert)->
  assert.ok typeof! String::startsWith is \Function, 'is function'
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
  re = /./
  assert.throws (-> '/./'startsWith re), TypeError
  re[Symbol?match] = no
  assert.ok try '/./'startsWith re
  catch e => no
  O = {}
  assert.ok try '[object Object]'startsWith O
  catch e => no
  O[Symbol?match] = on
  assert.throws (-> '[object Object]'startsWith O), TypeError