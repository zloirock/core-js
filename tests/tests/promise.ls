{isFunction} = Function
test 'Promise constructor' !->
  ok isFunction(global.Promise), 'Is function'
  ok Promise.length is 1, 'Promise.length is 1'
test 'Promise.all' !->
  ok isFunction(Promise.all), 'Is function'
test 'Promise.race' !->
  ok isFunction(Promise.race), 'Is function'
test 'Promise.resolve' !->
  ok isFunction(Promise.resolve), 'Is function'
test 'Promise.reject' !->
  ok isFunction(Promise.reject), 'Is function'
test 'Promise.cast' !->
  ok isFunction(Promise.cast), 'Is function'
test 'Promise::then' !->
  ok isFunction(Promise::then), 'Is function'
test 'Promise::catch' !->
  ok isFunction(Promise::catch), 'Is function'