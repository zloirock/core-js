QUnit.module 'ES6 Promise'
isFunction = -> typeof! it is \Function
test 'Promise' !->
  ok isFunction(core.Promise), 'Is function'
test '#then' !->
  ok isFunction(core.Promise::then), 'Is function'
test '#catch' !->
  ok isFunction(core.Promise::catch), 'Is function'
test '#@@toStringTag' !->
  ok core.Promise::[core.Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'
test '.all' !->
  ok isFunction(core.Promise.all), 'Is function'
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.all iter .catch ->
  ok passed, 'works with iterables'
test '.race' !->
  ok isFunction(core.Promise.race), 'Is function'
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.race iter .catch ->
  ok passed, 'works with iterables'
test '.resolve' !->
  ok isFunction(core.Promise.resolve), 'Is function'
test '.reject' !->
  ok isFunction(core.Promise.reject), 'Is function'