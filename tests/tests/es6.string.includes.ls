'use strict'
{module, test} = QUnit
module \ES6

test 'String#includes' (assert)->
  assert.ok typeof! String::includes is \Function, 'is function'
  assert.strictEqual String::includes.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::includes), 'looks like native'
  assert.strictEqual String::includes.name, \includes, 'name is "includes"'
  assert.ok not 'abc'includes!
  assert.ok 'aundefinedb'includes!
  assert.ok 'abcd'includes \b 1
  assert.ok not 'abcd'includes \b 2
  if !(-> @)!
    assert.throws (-> String::includes.call null, '.'), TypeError
    assert.throws (-> String::includes.call void, '.'), TypeError
  re = /./
  assert.throws (-> '/./'includes re), TypeError
  re[Symbol?match] = no
  assert.ok try '/./'includes re
  catch e => no
  O = {}
  assert.ok try '[object Object]'includes O
  catch e => no
  O[Symbol?match] = on
  assert.throws (-> '[object Object]'includes O), TypeError