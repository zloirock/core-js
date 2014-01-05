test \global !->
  ok global?
  ok global.global is global
  global.__tmp__ = {}
  ok __tmp__ is global.__tmp__