{isFunction} = Function
test 'Date.locale' !->
  {locale} = Date
  ok isFunction(locale), 'Is function'
  locale \en
  ok locale! is \en, 'Date.locale() is "en"'
  ok locale(\ru) is \ru, 'Date.locale("ru") is "ru"'
  ok locale! is \ru, 'Date.locale() is "ru"'
  ok locale(\xx) is \ru, 'Date.locale("xx") is "ru"'
test 'Date.addLocale' !->
  {addLocale, locale} = Date
  ok isFunction(addLocale), 'Is function'
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
  ok isFunction(Date::format), 'Is function'
  date = new Date 1 2 3 4 5 6 7
  ok date.format('dd.nn.yyyy') is '03.03.1901', 'Works basic'
  locale \en
  ok date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy foo yyyy' \ru) is '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 foo 1901', 'Works with locale from second argument'
  ok date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy foo yyyy') is '7 6 06 5 05 4 04 4 04 3 03 Sunday 3 03 March March 01 foo 1901', 'Works with defaut locale'
  locale \ru
  ok date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy foo yyyy') is '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 foo 1901', 'Works with set in Date.locale locale'