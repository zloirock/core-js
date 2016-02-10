{module, test} = QUnit
module \ES7

test 'Error.isError' (assert)!->
  {isError} = Error
  assert.isFunction isError
  assert.arity isError, 1
  assert.name isError, \isError
  assert.looksNative isError
  assert.nonEnumerable Error, \isError
  assert.same isError(new TypeError), on
  assert.same isError({}), no
  assert.same isError(null), no