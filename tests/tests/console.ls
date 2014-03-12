methods = <[assert count debug dir dirxml error exception group groupEnd groupCollapsed groupEnd info log table trace warn markTimeline profile profileEnd time timeEnd timeStamp]>
test 'console' !->
  ok Object.isObject(global.console), 'global.console is object'
test 'console.#{..} are functions' !->
  for methods => ok Function.isFunction(console[..]), "console.#{..} is function"
test 'call console.#{..}' !->
  for methods => ok (try console[..] \foo; on), "call console.#{..}"
test 'call unbound console.#{..}' !->
  for methods => ok (try console[..].call void \foo; on), "call unbound console.#{..}"
test 'console as console.log shortcut' !->
  ok Function.isFunction(console), 'console is function'
  ok console is console.log, 'console is console.log shortcut'
  ok (try console 'console'; on), 'call console'
test 'console.enabled' !->
  ok typeof! console.enabled is 'Boolean', 'console.enabled is boolean'
  ok console.enabled is on, 'console.enabled is true'
  console.enabled = no
  ok (try console('call disabled console') is void), 'call disabled console'
  console.enabled = on