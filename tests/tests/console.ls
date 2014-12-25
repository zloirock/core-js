if typeof! @process isnt 'process'
  QUnit.module \Console
  isFunction = -> typeof! it is \Function
  isObject = -> it is Object it
  methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
  test 'is object' !->
    ok isObject((global? && global || window)console), 'global.console is object'
  test 'console.{..} are functions' !->
    for methods => ok isFunction(console[..]), "console.#{..} is function"
  test 'call console.{..}' !->
    for methods => ok (try console[..] \foo; on), "call console.#{..}"
  test 'call unbound console.#{..}' !->
    for methods => ok (try console[..].call void \foo; on), "call unbound console.#{..}"
  test 'console.{enable, disable}' !->
    {enable, disable} = console
    ok isFunction(enable), 'console.enable is function'
    ok isFunction(disable), 'console.disable is function'
    ok (try disable!; on), 'disable console'
    ok (try console.log('call disabled console') is void), 'call disabled console'
    ok (try enable!; on), 'enable console'