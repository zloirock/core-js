isFunction = -> typeof! it is \Function
test 'Promise' !->
  ok isFunction((global? && global || window)Promise), 'Is function'
  ok isFunction(Promise::then), 'Promise::then is function'
  ok isFunction(Promise::catch), 'Promise::catch is function'
test 'Promise.all' !->
  ok isFunction(Promise.all), 'Is function'
test 'Promise.race' !->
  ok isFunction(Promise.race), 'Is function'
test 'Promise.resolve' !->
  ok isFunction(Promise.resolve), 'Is function'
test 'Promise.reject' !->
  ok isFunction(Promise.reject), 'Is function'