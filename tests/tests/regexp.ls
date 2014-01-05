{isFunction} = Object
test 'RegExp::getFlag' !->
  ok isFunction RegExp::getFlag
  ok /./gmi.getFlag!length is 3
  ok /qwe/i.getFlag! is \i
test 'RegExp::fn' !->
  ok isFunction /qwe/fn!
  ok /qwe/fn! \qwerty
  ok not /qwe/fn! \asd