{module, test} = QUnit
module \core-js

test 'RegExp.escape' (assert)!->
  {escape} = RegExp
  assert.isFunction escape
  assert.arity escape, 1
  assert.name escape, \escape
  assert.looksNative escape
  assert.strictEqual escape('qwe asd'), 'qwe asd', "Don't change simple string"
  assert.strictEqual escape('\\[]{}()*+?.^$|'), '\\\\\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|', 'Escape all RegExp special chars'