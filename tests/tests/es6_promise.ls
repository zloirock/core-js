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
test '.race' !->
  ok isFunction(Promise.race), 'Is function'
test '.resolve' !->
  ok isFunction(Promise.resolve), 'Is function'
test '.reject' !->
  ok isFunction(Promise.reject), 'Is function'