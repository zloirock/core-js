{isFunction} = Object
asyncTest 'setTimeout / clearTimeout' 2 ->
  global.setTimeout _, 1 \b \c <| (b, c)->
    ok b + c is \bc
  clearTimeout global.setTimeout _, 1 ->
    ok no
  global.setTimeout _, 20 <| ->
    ok on
    start!
asyncTest 'setInterval / clearInterval' 6 ->
  i = 1
  mark = global.setInterval (->
    ok i < 4
    ok it is 42
    if i is 3
      clearInterval mark
      start!
    i := i + 1), 1, 42
asyncTest 'setImmediate / clearImmediate' 4 ->
  ok isFunction global.setImmediate
  ok isFunction global.clearImmediate
  setImmediate _, \b \c <| (b, c)->
    ok b + c is \bc
  clearImmediate setImmediate ->
    ok no
  global.setTimeout _, 20 <| ->
    ok on
    start!