test \global ->
  ok global?
  equal global.global, global
  global.__tmp__ = {}
  equal __tmp__, global.__tmp__
  delete global.__tmp__