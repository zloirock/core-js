{module, test} = QUnit
module 'Web'

isFunction = -> typeof! it  is \Function
timeLimitedPromise = (time, fn)-> Promise.race [new Promise(fn), new Promise (res, rej)!-> setTimeout rej, time]

test 'setImmediate / clearImmediate' (assert)->
  assert.expect 10
  assert.ok isFunction(setImmediate), 'setImmediate is function'
  assert.ok isFunction(clearImmediate), 'clearImmediate is function'
  assert.ok /native code/.test(setImmediate), 'setImmediate looks like native'
  assert.ok /native code/.test(clearImmediate), 'clearImmediate looks like native'
  assert.strictEqual setImmediate.name, \setImmediate, 'setImmediate.name is "setImmediate"'
  assert.strictEqual clearImmediate.name, \clearImmediate, 'clearImmediate.name is "clearImmediate"'
  var def
  timeLimitedPromise(1e3, (res)!-> setImmediate !->
    def := \a
    res!
  ) .then  !-> assert.ok on 'setImmediate works'
    .catch !-> assert.ok no 'setImmediate works'
    .then assert.async!
  assert.strictEqual def, void, 'setImmediate is async'
  timeLimitedPromise(1e3, (res)-> setImmediate(((a, b)-> res a +  b), \a \b))
    .then  !-> assert.strictEqual it, \ab, 'setImmediate works with additional args'
    .catch !-> assert.ok no 'setImmediate works with additional args'
    .then assert.async!
  timeLimitedPromise(50, (res)-> clearImmediate setImmediate res)
    .then  !-> assert.ok no 'clearImmediate works'
    .catch !-> assert.ok on 'clearImmediate works'
    .then assert.async!

(!-> if window? => window.onload = it else it!) <| !-> setTimeout _, 5e3 <| !->
  x = 0
  now = Date.now!
  do inc = !-> setImmediate !->
    x := x + 1
    if Date.now! - now < 5e3 => inc!
    else console?log "setImmediate: #{x / 5} per second"