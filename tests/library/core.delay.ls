{module, test} = QUnit
module 'core-js'

{delay, Promise} = core
timeLimitedPromise = (time, fn)-> Promise.race [new Promise(fn), new Promise (res, rej)!-> setTimeout rej, time]

test 'delay' (assert)!->
  assert.expect 3
  assert.isFunction delay
  assert.ok delay(42) instanceof Promise, 'returns promises'
  timeLimitedPromise(1e3, (res)!-> delay(10).then !-> res it)
    .then  !-> assert.ok it is on, 'resolves as `true`'
    .catch !-> assert.ok no 'rejected'
    .then assert.async!