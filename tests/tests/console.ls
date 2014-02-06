{isFunction} = Function
{isObject} = Object
var id
test 'console' !->
  ok isObject(global.console), 'global.console is object'
test 'console.{...} are functions' !->
  {assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp} = console
  ok isFunction(log), 'console.log is function'
  ok isFunction(warn), 'console.warn is function'
  ok isFunction(error), 'console.error is function'
  ok isFunction(info), 'console.info is function'
  ok isFunction(time), 'console.time is function'
  ok isFunction(timeEnd), 'console.timeEnd is function'
  ok isFunction(assert), 'console.assert is function'
  ok isFunction(count), 'console.count is function'
  ok isFunction(debug), 'console.debug is function'
  ok isFunction(dir), 'console.dir is function'
  ok isFunction(dirxml), 'console.dirxml is function'
  ok isFunction(table), 'console.table is function'
  ok isFunction(trace), 'console.trace is function'
  ok isFunction(group), 'console.group is function'
  ok isFunction(groupEnd), 'console.groupEnd is function'
  ok isFunction(groupCollapsed), 'console.groupCollapsed is function'
  ok isFunction(markTimeline), 'console.markTimeline is function'
  ok isFunction(profile), 'console.profile is function'
  ok isFunction(profileEnd), 'console.profileEnd is function'
  ok isFunction(clear), 'console.clear is function'
test 'console.{...} call' !->
  ok (try console.log 'console.log'; on), 'call console.log'
  ok (try console.warn 'console.warn'; on), 'call console.warn'
  ok (try console.error 'console.error'; on), 'call console.error'
  ok (try console.info 'console.info'; on), 'call console.info'
  ok (try console.time id := 'console.time'; on), 'call console.time'
  ok (try console.timeEnd id; on), 'call console.timeEnd'
  ok (try console.assert on on 'console.assert'; on), 'call console.assert'
  ok (try console.count 'console.count'; on), 'call console.count'
  ok (try console.debug 'console.debug'; on), 'call console.debug'
  ok (try console.dir q:1 w:2 e:3; on), 'call console.dir'
  ok (try console.dirxml document?getElementById 'qunit-header'; on), 'call console.dirxml'
  ok (try console.table [<[q w]> <[call console.table]>]; on), 'call console.table'
  ok (try console.trace!; on), 'call console.trace'
  ok (try console.group id := 'console.group'; on), 'call console.group'
  ok (try console.groupEnd id; on), 'call console.groupEnd'
  ok (try
    console.groupCollapsed id := 'console.groupCollapsed'
    console.groupEnd id
    on), 'call console.groupCollapsed'
  ok (try console.profile 'profile'; on), 'call console.profile'
  ok (try console.profileEnd 'profile'; on), 'call console.profileEnd'
  ok (try console.clear!; on), 'call console.clear'
test 'console.{...} are unbound' !->
  {assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp} = console
  ok (try log 'log'; on), 'call log'
  ok (try warn 'warn'; on), 'call warn'
  ok (try error 'error'; on), 'call error'
  ok (try info 'info'; on), 'call info'
  ok (try time id := 'time'; on), 'call time'
  ok (try timeEnd id; on), 'call timeEnd'
  ok (try assert on on 'assert'; on), 'call assert'
  ok (try count 'count'; on), 'call count'
  ok (try debug 'debug'; on), 'call debug'
  ok (try dir q:1 w:2 e:3; on), 'call dir'
  ok (try dirxml document?getElementById 'qunit-header'; on), 'call dirxml'
  ok (try table [<[q w]> <[call table]>]; on), 'call table'
  ok (try trace!; on), 'call trace'
  ok (try group id := 'group'; on), 'call group'
  ok (try groupEnd id; on), 'call groupEnd'
  ok (try
    groupCollapsed id := 'groupCollapsed'
    groupEnd id
    on), 'call groupCollapsed'
  ok (try profile 'profile'; on), 'call profile'
  ok (try profileEnd 'profile'; on), 'call profileEnd'
  ok (try clear!; on), 'call clear'
test 'console as console.log shortcut' !->
  ok isFunction(console), 'console is function'
  ok console is console.log, 'console is console.log shortcut'
  ok (try console 'console'; on), 'call console'
test 'console.enabled' !->
  ok typeof! console.enabled is 'Boolean', 'console.enabled is boolean'
  ok console.enabled is on, 'console.enabled is true'
  console.enabled = no
  ok (try console('call disabled console') is void), 'call disabled console'
  console.enabled = on