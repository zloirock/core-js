{module, test} = QUnit
module 'ESNext'

test 'Symbol.observable' (assert)!->
  assert.ok \observable of Symbol, "Symbol.observable available"
  assert.nonEnumerable Symbol, \observable
  assert.ok Object(Symbol.observable) instanceof Symbol, "Symbol.observable is symbol"
  if DESCRIPTORS
    desc = Object.getOwnPropertyDescriptor Symbol, \observable
    assert.ok !desc.enumerble, 'non-enumerable'
    assert.ok !desc.writable, 'non-writable'
    assert.ok !desc.configurable, 'non-configurable'