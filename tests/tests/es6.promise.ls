QUnit.module 'ES6 Promise'
isFunction = -> typeof! it is \Function
test 'Promise' !->
  ok isFunction((global? && global || window)Promise), 'Is function'
test '#then' !->
  ok isFunction(Promise::then), 'Is function'
test '#catch' !->
  ok isFunction(Promise::catch), 'Is function'
test '#@@toStringTag' !->
  ok Promise::[Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'
test '.all' !->
  ok isFunction(Promise.all), 'Is function'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.all iter .catch ->
  ok passed, 'works with iterables'
test '.race' !->
  ok isFunction(Promise.race), 'Is function'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.race iter .catch ->
  ok passed, 'works with iterables'
test '.resolve' !->
  ok isFunction(Promise.resolve), 'Is function'
test '.reject' !->
  ok isFunction(Promise.reject), 'Is function'