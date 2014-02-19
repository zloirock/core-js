{isFunction} = Function
test 'Date.locale' !->
  {locale} = Date
  ok isFunction locale
  locale \en
  ok locale! is \en
  ok locale(\ru) is \ru
  ok locale! is \ru
  ok locale(\xx) is \ru
test 'Date.addLocale' !->
  {addLocale, locale} = Date
  ok isFunction addLocale
  ok locale(\en) is \en
  ok locale(\zz) is \en
  ok addLocale(\zz, {
    w: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    M: 'Январ+ь|я,Феврал+ь|я,Март+|а,Апрел+ь|я,Ма+й|я,Июн+ь|я,Июл+ь|я,Август+|а,Сентябр+ь|я,Октябр+ь|я,Ноябр+ь|я,Декабр+ь|я'
  }) is Date
  ok locale(\zz) is \zz
  ok new Date(1 2 3 4 5 6 7)format('w, d MM yyyy', \zz) is 'Воскресенье, 3 Марта 1901'
test 'Date::format' !->
  {locale} = Date
  ok isFunction Date::format
  date = new Date 1 2 3 4 5 6 7
  ok date.format('dd.nn.yyyy') is '03.03.1901'
  locale \en
  ok date.format('w, d MM yyyy') is 'Sunday, 3 March 1901'
  ok date.format('w, d MM yyyy', \ru) is 'Воскресенье, 3 Марта 1901'
  locale \ru
  ok date.format('w, d MM yyyy') is 'Воскресенье, 3 Марта 1901'
  ok date.format('d MM') is '3 Марта'
  ok date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy yyyy') is '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 1901'