{isFunction} = Function
asyncTest 'setTimeout / clearTimeout' 2 !->
  global.setTimeout _, 1 \b \c <| (b, c)!->
    ok b + c is \bc
  clearTimeout global.setTimeout _, 1 !->
    ok no
  global.setTimeout _, 20 <| !->
    ok on
    start!
asyncTest 'setInterval / clearInterval' 6 !->
  i = 1
  interval = global.setInterval (!->
    ok i < 4
    ok it is 42
    if i is 3
      clearInterval interval
      start!
    i := i + 1), 1, 42
asyncTest 'setImmediate / clearImmediate' 6 !->
  ok isFunction(global.setImmediate), 'setImmediate is function'
  ok isFunction(global.clearImmediate), 'clearImmediate is function'
  var tmp1
  id = setImmediate !-> tmp1 := 42
  ok tmp1 is void, 'setImmediate is async'
  #ok Number.isInteger(id) && id > 0, 'setImmediate return id' # fail in node 0.9+
  var tmp2
  setImmediate !->
    tmp2 := on
  setTimeout _, 20 <| !->
    ok tmp2, 'setImmediate works'
  var tmp3
  setImmediate _, \b \c <| (b, c)!->
    tmp3 := b + c
  setTimeout _, 20 <| !->
    ok tmp3 is \bc, 'setImmediate works with additional params'
  var tmp4
  clearImmediate setImmediate !-> tmp4 := 42
  setTimeout _, 20 <| !->
    ok tmp4 is void, 'clearImmediate works'
  setTimeout start, 50

bzzzzz = ->
  x = 0
  now = Date.now!
  do inc = -> setImmediate ->
    x := x + 1
    if Date.now! - now < 1000 => inc!
    else console "setImmediate: #x per second"
if window? => window.onload = bzzzzz else bzzzzz!