QUnit.module 'core-js log'
isFunction = -> typeof! it is \Function
isObject = -> it is Object it
{log} = core
methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
test 'is object' !->
  ok isObject(log), 'global.log is object'
test 'log.{..} are functions' !->
  for methods => ok isFunction(log[..]), "log.#{..} is function"
test 'call log.{..}' !->
  for m in methods => ok (try 
    if m is \profileEnd => log[m]!
    else log[m] \foo
    on
  ), "call log.#m"
test 'call unbound log.#{..}' !->
  for m in methods => ok (try 
    if m is \profileEnd => log[m].call void
    else log[m].call void \foo
    on
  ), "call unbound log.#m"
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