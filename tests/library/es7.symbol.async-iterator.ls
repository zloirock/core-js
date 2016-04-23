{module, test} = QUnit
module \ES7

test 'Symbol.asyncIterator' (assert)!->
  {Symbol} = core
  assert.ok \asyncIterator of Symbol, "Symbol.asyncIterator available"
  assert.ok Object(Symbol.asyncIterator) instanceof Symbol, "Symbol.asyncIterator is symbol"