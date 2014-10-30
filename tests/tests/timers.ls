QUnit.module \Timers
that = global? && global || window
asyncTest 'setTimeout / clearTimeout' 2 !->
  that.setTimeout _, 1 \b \c <| (b, c)!->
    ok b + c is \bc
  clearTimeout that.setTimeout _, 1 !->
    ok no
  that.setTimeout _, 20 <| !->
    ok on
    start!
asyncTest 'setInterval / clearInterval' 6 !->
  i = 1
  interval = that.setInterval (!->
    ok i < 4
    ok it is 42
    if i is 3
      clearInterval interval
      start!
    i := i + 1), 1, 42