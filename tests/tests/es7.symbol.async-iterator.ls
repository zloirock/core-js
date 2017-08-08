{module, test} = QUnit
module 'ESNext'

test 'Symbol.asyncIterator' (assert)!->
  assert.ok \asyncIterator of Symbol, "Symbol.asyncIterator available"
  assert.nonEnumerable Symbol, \asyncIterator
  assert.ok Object(Symbol.asyncIterator) instanceof Symbol, "Symbol.asyncIterator is symbol"
  if DESCRIPTORS
    desc = Object.getOwnPropertyDescriptor Symbol, \asyncIterator
    assert.ok !desc.enumerble, 'non-enumerable'
    assert.ok !desc.writable, 'non-writable'
    assert.ok !desc.configurable, 'non-configurable'