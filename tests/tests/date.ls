isFunction = -> typeof! it is \Function
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
    weekdays: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота',
    months: 'Январ:я|ь,Феврал:я|ь,Март:а|,Апрел:я|ь,Ма:я|й,Июн:я|ь,Июл:я|ь,Август:а|,Сентябр:я|ь,Октябр:я|ь,Ноябр:я|ь,Декабр:я|ь'
  }) is Date
  ok locale(\zz) is \zz
  ok new Date(1 2 3 4 5 6 7)format('W, D MM YYYY') is 'Воскресенье, 3 Марта 1901'
test 'Date::format' !->
  {locale} = Date
  ok isFunction(Date::format), 'Is function'
  date = new Date 1 2 3 4 5 6 7
  ok date.format('DD.NN.YYYY') is '03.03.1901', 'Works basic'
  locale \en
  ok date.format('mmm s ss m mm h hh H HH D DD W N NN M MM YY foo YYYY') is '007 6 06 5 05 4 04 4 04 3 03 Sunday 3 03 March March 01 foo 1901', 'Works with defaut locale'
  locale \ru
  ok date.format('mmm s ss m mm h hh H HH D DD W N NN M MM YY foo YYYY') is '007 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 foo 1901', 'Works with set in Date.locale locale'
test 'Date::formatUTC' !->
  ok isFunction(Date::formatUTC), 'Is function'
  date = new Date 1 2 3 4 5 6 7
  ok date.formatUTC(\h) is '' + date.getUTCHours!, 'Works'