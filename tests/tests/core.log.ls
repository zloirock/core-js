if typeof! @process isnt 'process'
  QUnit.module 'core.log'
  isFunction = -> typeof! it is \Function
  isObject = -> it is Object it
  methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
  test 'is object' !->
    ok isObject((global? && global || window)log), 'global.log is object'
  test 'log.{..} are functions' !->
    for methods => ok isFunction(log[..]), "log.#{..} is function"
  test 'call log.{..}' !->
    for methods => ok (try log[..] \foo; on), "call log.#{..}"
  test 'call unbound log.#{..}' !->
    for methods => ok (try log[..].call void \foo; on), "call unbound log.#{..}"
  test 'log.{enable, disable}' !->
    {enable, disable} = log
    ok isFunction(enable), 'log.enable is function'
    ok isFunction(disable), 'log.disable is function'
    ok (try disable!; on), 'disable log'
    ok (try log.log('call disabled log') is void), 'call disabled log'
    ok (try enable!; on), 'enable log'
  test 'log' !->
    ok isFunction(log), 'global.log is function'
    ok (try log(42); on), 'call log'