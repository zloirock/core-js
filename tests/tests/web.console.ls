if typeof! @process isnt 'process'
  QUnit.module 'web.console'
  methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
  test 'console available' !->
    ok console?, 'global.console available'
  test 'console.{..} available' !->
    for methods => ok .. of console, "console.#{..} available"
  test 'call console.{..}' !->
    for methods => ok (try console[..] \foo; on), "call console.#{..}"