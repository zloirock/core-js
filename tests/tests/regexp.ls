{isFunction} = Object
test 'RegExp::getFlags' !->
  ok isFunction RegExp::getFlags
  ok /./gmi.getFlags!length is 3
  ok /qwe/i.getFlags! is \i
test 'RegExp::fn' !->
  ok isFunction /qwe/fn!
  ok /qwe/fn! \qwerty
  ok not /qwe/fn! \asd