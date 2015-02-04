QUnit.module 'core-js global'
test \global !->
  ok global?, 'global is define'
  ok global.global is global, 'global.global is global'
  global.__tmp__ = {}
  ok __tmp__ is global.__tmp__, 'global object properties are global variables'