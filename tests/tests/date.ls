{isFunction} = Function
test 'Date.locale' !->
  ok isFunction Date.locale
  Date.locale \ru
  ok Date.locale! is \ru
test 'Date.addLocale' !->
  ok isFunction Date.addLocale
test 'Date::format' !->
  ok isFunction Date::format
  date = new Date 1 2 3 4 5 6 7
  ok date.format('dd.nn.yyyy') is '03.03.1901'
  Date.locale \en
  ok date.format('w, d MM yyyy') is 'Sunday, 3 March 1901'
  ok date.format('w, d MM yyyy', \ru) is 'Воскресенье, 3 Марта 1901'
  Date.locale \ru
  ok date.format('w, d MM yyyy') is 'Воскресенье, 3 Марта 1901'
  ok date.format('d MM') is '3 Марта'
  ok date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy yyyy') is '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 1901'