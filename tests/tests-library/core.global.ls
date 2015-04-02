QUnit.module 'core-js global'
{global} = core
test \global !->
  ok global?, 'global is define'
  global.__tmp__ = {}
  ok __tmp__ is global.__tmp__, 'global object properties are global variables'