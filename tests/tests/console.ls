{isFunction} = Object
test \console !->
  {assert, count, clear, debug, dir, dirxml, error, exception, group, groupCollapsed, groupEnd, info, log, table, trace, warn, markTimeline, profile, profileEnd, time, timeEnd, timeStamp} = console
  var id
  ok isFunction global.console
  ok try console 'console' ; on
  ok try console.call {} 'console in another context' ; on
  ok isFunction console.log
  ok console is console.log
  ok isFunction console.warn
  ok try console.warn 'console.warn' ; on
  ok try warn 'console.warn in another context' ; on
  ok isFunction console.error
  ok try console.error 'console.error' ; on
  ok try error 'console.error in another context' ; on
  ok isFunction console.info
  ok try console.info 'console.info' ; on
  ok try info 'console.info in another context' ; on
  ok isFunction console.time
  ok isFunction console.timeEnd
  ok try console.time id := 'console.time' ; on
  ok try console.timeEnd id ; on
  ok try time id := 'console.time in another context' ; on
  ok try timeEnd id ; on
  ok isFunction console.assert
  ok try console.assert on on 'console.assert' ; on
  ok try assert on on 'console.assert in another context' ; on
  ok isFunction console.count
  ok try console.count 'console.count' ; on
  ok try count 'console.count in another context' ; on
  ok isFunction console.debug
  ok try console.debug 'console.debug' ; on
  ok try debug 'console.debug in another context' ; on
  ok isFunction console.dir
  ok try console.dir q:1 w:2 e:3 ; on
  ok try dir q:1 w:2 e:3 ; on
  ok isFunction console.dirxml
  ok try console.dirxml document?getElementById 'qunit-header' ; on
  ok try dirxml document?getElementById 'qunit-header' ; on
  ok isFunction console.table
  ok try console.table [<[q w]> <[call console.table]>] ; on
  ok try table [<[q w]> <[call console.table]>] ; on
  ok isFunction console.trace
  ok try console.trace! ; on
  ok try trace! ; on
  ok isFunction console.group
  ok try console.group id := 'console.group' ; on
  ok isFunction console.groupEnd
  ok try console.groupEnd id ; on
  ok try group id := 'console.group in another context' ; on
  ok try groupEnd id ; on
  ok isFunction console.groupCollapsed
  ok try
    console.groupCollapsed id := 'console.groupCollapsed'
    console.groupEnd id ; on
  ok try
    groupCollapsed id := 'console.groupCollapsed in another context'
    groupEnd id ; on
  ok isFunction console.markTimeline
  ok isFunction console.profile
  ok isFunction console.profileEnd
  ok try console.profile 'profile' ; on
  ok try console.profileEnd 'profile' ; on
  ok try profile 'profile in another context' ; on
  ok try profileEnd 'profile in another context' ; on