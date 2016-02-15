{module, test} = QUnit
module \core-js

test 'RegExp.escape' (assert)!->
  {escape} = core.RegExp
  assert.isFunction escape
  assert.strictEqual escape('qwe asd'), 'qwe asd', "Don't change simple string"
  assert.strictEqual escape('\\[]{}()*+?.^$|'), '\\\\\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|', 'Escape all RegExp special chars'