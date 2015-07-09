QUnit.module \ES6

eq = strictEqual

test 'String#search regression' !->
  ok typeof! ''search is \Function, 'String#search is function'
  eq ''search.length, 1, 'String#search length is 1'
  ok /native code/.test(''search), 'looks like native'
  if \name of ''search => eq ''search.name, \search, 'String#search is "search" (can fail if compressed)'
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/search
  instance = Object on
  instance.search = String::search
  eq instance.search(on), 0, 'S15.5.4.12_A1_T1'
  instance = Object no
  instance.search = String::search
  eq instance.search(no), 0, 'S15.5.4.12_A1_T2'
  eq ''search!, 0, 'S15.5.4.12_A1_T4 #1'
  eq '--undefined--'search!, 0, 'S15.5.4.12_A1_T4 #2'
  eq 'gnulluna'search(null), 1, 'S15.5.4.12_A1_T5'
  eq Object(\undefined)search(void), 0, 'S15.5.4.12_A1_T6'
  eq 'undefined'search(void), 0, 'S15.5.4.12_A1_T7'
  eq String({toString: ->})search(void), 0, 'S15.5.4.12_A1_T8'
  eq 'ssABB\u0041BABAB'search({toString: -> '\u0041B'}), 2, 'S15.5.4.12_A1_T10'
  try
    'ABB\u0041BABAB'search {toString: ->  throw \intostr}
    ok no, 'S15.5.4.12_A1_T11 #1 lead to throwing exception'
  catch e
    eq e, \intostr, 'S15.5.4.12_A1_T11 #2'
  try
    Object('ABB\u0041BABAB')search {toString: (-> {}), valueOf: -> throw \intostr}
    ok no, 'S15.5.4.12_A1_T12 #1 lead to throwing exception'
  catch e
    eq e, \intostr, 'S15.5.4.12_A1_T12 #2'
  eq 'ABB\u0041B\u0031ABAB\u0031BBAA'search({toString: (-> {}), valueOf: -> 1}), 5, 'S15.5.4.12_A1_T13'
  eq 'ABB\u0041BABAB\u0037\u0037BBAA'search(RegExp \77), 9, 'S15.5.4.12_A1_T14'
  eq Object('test string')search(\string), 5, 'S15.5.4.12_A2_T1'
  eq Object('test string')search(\String), -1, 'S15.5.4.12_A2_T2'
  eq Object('test string')search(/String/i), 5, 'S15.5.4.12_A2_T3'
  eq Object('test string')search(/Four/), -1, 'S15.5.4.12_A2_T4'
  eq Object('one two three four five')search(/four/), 14, 'S15.5.4.12_A2_T5'
  eq Object('test string')search(\notexist), -1, 'S15.5.4.12_A2_T6'
  eq Object('test string probe')search('string pro'), 5, 'S15.5.4.12_A2_T7'
  aString = Object 'power of the power of the power of the power of the power of the power of the great sword'
  eq aString.search(/the/), aString.search(/the/g), 'S15.5.4.12_A3_T1'
  aString = Object 'power \u006F\u0066 the power of the power \u006F\u0066 the power of the power \u006F\u0066 the power of the great sword'
  eq aString.search(/of/), aString.search(/of/g), 'S15.5.4.12_A3_T2'

test 'RegExp#@@search' !->
  ok typeof! /./[Symbol.search] is \Function, 'RegExp#@@search is function'
  eq /./[Symbol.search].length, 1, 'RegExp#@@search length is 1'
  eq /four/[Symbol.search]('one two three four five'), 14
  eq /Four/[Symbol.search]('one two three four five'), -1

test '@@search logic' !->
  O = {(Symbol.search): -> {value: it}}
  eq 'qwe'search(O)value, \qwe
  eq ''search.call(123, O)value, \123
  re = /./
  re[Symbol.search] = -> {value: it}
  eq 'qwe'search(re)value, \qwe
  eq ''search.call(123, re)value, \123
  