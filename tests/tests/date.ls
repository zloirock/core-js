{isFunction} = Object
test 'Date.locale' ->
  ok isFunction Date.locale
  Date.locale \ru
  equal Date.locale!, \ru
test 'Date.addLocale' ->
  ok isFunction Date.addLocale
test 'Date.format' ->
  ok isFunction Date.format
  ok Date.now! - Date.format(\ms) > -10
test 'Date::format' ->
  ok isFunction Date::format
  date = new Date 1 2 3 4 5 6 7
  equal date.format('dd.nn.yyyy'), '03.03.1901'
  Date.locale \en
  equal date.format('w, d M yyyy'), 'Sunday, 3 March 1901'
  equal date.format('w, d M yyyy', \ru), 'Воскресенье, 3 Март 1901'
  Date.locale \ru
  equal date.format('w, d M yyyy'), 'Воскресенье, 3 Март 1901'
  equal date.format('d MM'), '3 Марта'
  equal date.format('ms s ss m mm h hh H HH d dd w n nn M MM yy yyyy'), '7 6 06 5 05 4 04 4 04 3 03 Воскресенье 3 03 Март Марта 01 1901'