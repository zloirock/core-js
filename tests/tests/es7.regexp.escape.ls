QUnit.module \ES7

eq = strictEqual

test 'RegExp.escape' !->
  {escape} = RegExp
  ok typeof! escape is \Function, 'Is function'
  ok /native code/.test(escape), 'looks like native'
  eq escape.length, 1, 'arity is 1'
  if \name of escape => eq escape.name, \escape, 'name is "escape"'
  eq escape('qwe asd'), 'qwe asd', "Don't change simple string"
  eq escape('\\[]{}()*+?.^$|'), '\\\\\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|', 'Escape all RegExp special chars'