if typeof! @process isnt 'process'
  QUnit.module 'web.console'
  isFunction = -> typeof! it is \Function
  isObject = -> it is Object it
  methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
  test 'is object' !->
    ok isObject((global? && global || window)console), 'global.console is object'
  test 'console.{..} are functions' !->
    for methods => ok isFunction(console[..]), "console.#{..} is function"
  test 'call console.{..}' !->
    for methods => ok (try console[..] \foo; on), "call console.#{..}"