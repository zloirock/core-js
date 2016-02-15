{module, test} = QUnit
module 'Web'

timeLimitedPromise = (time, fn)-> Promise.race [new Promise(fn), new Promise (res, rej)-> setTimeout rej, time]
{setImmediate, clearImmediate, Promise} = core

test 'setImmediate / clearImmediate' (assert)!->
  assert.expect 6
  assert.isFunction setImmediate, 'setImmediate is function'
  assert.isFunction clearImmediate, 'clearImmediate is function'
  var def
  timeLimitedPromise(1e3, (res)!-> setImmediate !->
    def := \a
    res!
  ) .then  !-> assert.ok on 'setImmediate works'
    .catch !-> assert.ok no 'setImmediate works'
    .then assert.async!
  assert.strictEqual def, void, 'setImmediate is async'
  timeLimitedPromise(1e3, (res)!-> setImmediate(((a, b)!-> res a +  b), \a \b))
    .then  !-> assert.strictEqual it, \ab, 'setImmediate works with additional args'
    .catch !-> assert.ok no 'setImmediate works with additional args'
    .then assert.async!
  timeLimitedPromise(50, (res)!-> clearImmediate setImmediate res)
    .then  !-> assert.ok no 'clearImmediate works'
    .catch !-> assert.ok on 'clearImmediate works'
    .then assert.async!

(!-> if window? => window.onload = it else it!) <| !-> setTimeout _, 5e3 <| !->
  x = 0
  now = +new Date
  do inc = !-> setImmediate !->
    x := x + 1
    if +new Date! - now < 5e3 => inc!
    else console?log "setImmediate: #{x / 5} per second"