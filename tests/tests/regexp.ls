QUnit.module \RegExp
isFunction = -> typeof! it is \Function
test '.escape' !->
  {escape} = RegExp
  ok isFunction(escape), 'Is function'
  ok escape('qwe asd') is 'qwe asd', "Don't change simple string"
  ok escape('\\-[]{}()*+?.,^$|') is "\\\\\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\,\\^\\$\\|", 'Escape all RegExp special chars'