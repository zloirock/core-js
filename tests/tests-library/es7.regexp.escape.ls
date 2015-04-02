QUnit.module 'ES7 RegExp.escape'

eq = strictEqual

test '*' !->
  {escape} = core.RegExp
  ok typeof! escape is \Function, 'Is function'
  eq escape('qwe asd'), 'qwe asd', "Don't change simple string"
  eq escape('\\-[]{}()*+?.,^$|'), '\\\\\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\^\\$\\|', 'Escape all RegExp special chars'