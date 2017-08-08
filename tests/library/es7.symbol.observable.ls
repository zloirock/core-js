{module, test} = QUnit
module 'ESNext'

test 'Symbol.observable' (assert)!->
  {Symbol} = core
  assert.ok \observable of Symbol, "Symbol.observable available"
  assert.ok Object(Symbol.observable) instanceof Symbol, "Symbol.observable is symbol"