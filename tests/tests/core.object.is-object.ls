{module, test} = QUnit
module \core-js

test 'Object.isObject' (assert)!->
  {isObject} = Object
  assert.isFunction isObject
  assert.ok not isObject(void), 'isObject undefined return false'
  assert.ok not isObject(null), 'isObject null return false'
  assert.ok not isObject(1), 'isObject number return false'
  assert.ok not isObject(true), 'isObject bool return false'
  assert.ok not isObject('string'), 'isObject string return false'
  assert.ok isObject(new Number 1), 'isObject new Number return true'
  assert.ok isObject(new Boolean no), 'isObject new Boolean return true'
  assert.ok isObject(new String 1), 'isObject new String return true'
  assert.ok isObject({}), 'isObject object return true'
  assert.ok isObject([]), 'isObject array return true'
  assert.ok isObject(/./), 'isObject regexp return true'
  assert.ok isObject(->), 'isObject function return true'
  assert.ok isObject(new ->), 'isObject constructor instance return true'