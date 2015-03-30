QUnit.module 'core-js delay'

timeLimitedPromise = (time, fn)-> Promise.race [new Promise(fn), new Promise (res, rej)-> setTimeout rej, time]

test '*' !->
  it.expect 3
  ok typeof! delay is \Function, 'is function'
  ok delay(42) instanceof Promise, 'returns promises'
  
  timeLimitedPromise(1e3, !(res)-> delay(10).then !-> res it)
    .then  -> ok it is on, 'resolves as `true`'
    .catch -> ok no 'rejected'
    .then it.async!