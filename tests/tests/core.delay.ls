{module, test} = QUnit
module \core-js

timeLimitedPromise = (time, fn)-> Promise.race [new Promise(fn), new Promise (res, rej)-> setTimeout rej, time]

test 'delay' (assert)!->
  assert.expect 6
  assert.isFunction delay
  assert.arity delay, 1
  assert.name delay, \delay
  assert.looksNative delay
  assert.ok delay(42) instanceof Promise, 'returns promises'
  
  timeLimitedPromise(1e3, !(res)-> delay(10).then !-> res it)
    .then  -> assert.ok it is on, 'resolves as `true`'
    .catch -> assert.ok no 'rejected'
    .then assert.async!