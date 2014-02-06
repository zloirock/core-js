{isFunction} = Function
test 'Promise constructor' !->
  ok isFunction(global.Promise), 'Promise is function'
  ok Promise.length is 1, 'Promise.length is 1'
test 'Promise.all' !->
  ok isFunction(Promise.all), 'Promise.all is function'
test 'Promise.race' !->
  ok isFunction(Promise.race), 'Promise.race is function'
test 'Promise.resolve' !->
  ok isFunction(Promise.resolve), 'Promise.resolve is function'
test 'Promise.reject' !->
  ok isFunction(Promise.reject), 'Promise.reject is function'
test 'Promise.cast' !->
  ok isFunction(Promise.cast), 'Promise.cast is function'
test 'Promise::then' !->
  ok isFunction(Promise::then), 'Promise::then is function'
test 'Promise::catch' !->
  ok isFunction(Promise::catch), 'Promise::catch is function'