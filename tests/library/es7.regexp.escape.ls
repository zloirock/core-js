{module, test} = QUnit
module \ES7

test 'RegExp.escape' (assert)->
  {escape} = core.RegExp
  assert.ok typeof! escape is \Function, 'Is function'
  assert.strictEqual escape('qwe asd'), 'qwe asd', "Don't change simple string"
  assert.strictEqual escape('\\[]{}()*+?.^$|'), '\\\\\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|', 'Escape all RegExp special chars'