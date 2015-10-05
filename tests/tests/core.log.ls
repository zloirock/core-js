{module, test} = QUnit
module \core-js

methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>

test 'log is object' (assert)->
  assert.ok Object(log) == log, 'global.log is object'

test 'log.{..} are functions' (assert)->
  for methods => assert.isFunction log[..], "log.#{..} is function"

test 'call log.{..}' (assert)->
  for m in methods => assert.ok (try 
    if m is \profileEnd => log[m]!
    else log[m] \foo
    on
  ), "call log.#m"

test 'call unbound log.#{..}' (assert)->
  for m in methods => assert.ok (try 
    if m is \profileEnd => log[m].call void
    else log[m].call void \foo
    on
  ), "call unbound log.#m"

test 'log.{enable, disable}' (assert)->
  {enable, disable} = log
  assert.isFunction enable, 'log.enable is function'
  assert.isFunction disable, 'log.disable is function'
  assert.ok (try disable!; on), 'disable log'
  assert.ok (try log.log('call disabled log') is void), 'call disabled log'
  assert.ok (try enable!; on), 'enable log'

test 'log' (assert)->
  assert.isFunction log
  assert.ok (try log(42); on), 'call log'