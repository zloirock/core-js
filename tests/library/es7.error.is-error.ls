{module, test} = QUnit
module \ES7

test 'Error.isError' (assert)!->
  {isError} = core.Error
  assert.isFunction isError
  assert.same isError(new TypeError), on
  assert.same isError({}), no
  assert.same isError(null), no