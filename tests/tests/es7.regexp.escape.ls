{module, test} = QUnit
module \ES7

test 'RegExp.escape' (assert)->
  {escape} = RegExp
  assert.ok typeof! escape is \Function, 'Is function'
  assert.ok /native code/.test(escape), 'looks like native'
  assert.strictEqual escape.length, 1, 'arity is 1'
  assert.strictEqual escape.name, \escape, 'name is "escape"'
  assert.strictEqual escape('qwe asd'), 'qwe asd', "Don't change simple string"
  assert.strictEqual escape('\\[]{}()*+?.^$|'), '\\\\\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|', 'Escape all RegExp special chars'