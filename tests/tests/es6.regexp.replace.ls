QUnit.module \ES6

eq = strictEqual

test 'String#replace regression' !->
  ok typeof! ''replace is \Function, 'String#replace is function'
  eq ''replace.length, 2, 'String#replace length is 2'
  ok /native code/.test(''replace), 'looks like native'
  if \name of ''replace => eq ''replace.name, \replace, 'String#replace is "replace" (can fail if compressed)'
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/replace
  instance = Object true
  instance.replace = String::replace
  eq instance.replace(on, 1), \1, 'S15.5.4.11_A1_T1'
  instance = Object no
  instance.replace = String::replace
  eq instance.replace(no, void), \undefined, 'S15.5.4.11_A1_T2'
  eq 'gnulluna'replace(null, (a1, a2, a3)-> a2 + ''), \g1una, 'S15.5.4.11_A1_T4'
  eq 'gnulluna'replace(null, ->), \gundefineduna, 'S15.5.4.11_A1_T5'
  eq Object(\undefined)replace(void, -> &[1] + 42), \42, 'S15.5.4.11_A1_T6'
  eq 'undefined'replace(\e, void), \undundefinedfined, 'S15.5.4.11_A1_T7'
  eq String({toString: ->})replace(/e/g, void), \undundefinedfinundefinedd, 'S15.5.4.11_A1_T8'
  eq new String({valueOf: (->), toString: void})replace((->)!, (a1, a2, a3)-> a1 + a2 + a3), \undefined0undefined, 'S15.5.4.11_A1_T9'
  eq 'ABB\u0041BABAB'replace({toString: -> '\u0041B'}, ->), \undefinedBABABAB, 'S15.5.4.11_A1_T10'
  /* wrong order in some old environments
  try
    'ABB\u0041BABAB'replace {toString: -> throw \insearchValue}, {toString: -> throw \inreplaceValue}
    ok no, 'S15.5.4.11_A1_T11 #1 lead to throwing exception'
  catch e
    eq e, \insearchValue, 'S15.5.4.11_A1_T11 #2'
  try
    Object('ABB\u0041BABAB')replace {toString: (->{}), valueOf: -> throw \insearchValue}, {toString: -> throw \inreplaceValue}
    ok no, 'S15.5.4.11_A1_T12 #1 lead to throwing exception'
  catch e
    eq e, \insearchValue, 'S15.5.4.11_A1_T12 #2'
  */
  try
    'ABB\u0041BABAB\u0031BBAA'replace {toString: (->{}), valueOf: -> throw \insearchValue}, {toString: -> 1}
    ok no, 'S15.5.4.11_A1_T13 #1 lead to throwing exception'
  catch e
    eq e, \insearchValue, 'S15.5.4.11_A1_T13 #2'
  eq 'ABB\u0041BABAB\u0037\u0037BBAA'replace(new RegExp(\77), 1), 'ABBABABAB\u0031BBAA', 'S15.5.4.11_A1_T14'
  instance = Object 1100.00777001
  instance.replace = String::replace
  try
    instance.replace {toString: -> /77/}, 1
    ok no, 'S15.5.4.11_A1_T15 #1 lead to throwing exception'
  catch e
    ok e instanceof TypeError, 'S15.5.4.11_A1_T15 #2'
  instance = Object 1100.00777001
  instance.replace = String::replace
  try
    instance.replace /77/, {toString: -> (a1, a2, a3)-> a2 + \z}
    ok no, 'S15.5.4.11_A1_T16 #1 lead to throwing exception'
  catch e
    ok e instanceof TypeError, 'S15.5.4.11_A1_T16 #2'
  eq 'asdf'replace(RegExp('' \g), \1), \1a1s1d1f1, 'S15.5.4.11_A1_T17'
  eq 'She sells seashells by the seashore.'replace(/sh/g, \sch), 'She sells seaschells by the seaschore.', 'S15.5.4.11_A2_T1'
  eq 'She sells seashells by the seashore.'replace(/sh/g, \$$sch), 'She sells sea$schells by the sea$schore.', 'S15.5.4.11_A2_T2'
  eq 'She sells seashells by the seashore.'replace(/sh/g, '$&sch'), 'She sells seashschells by the seashschore.', 'S15.5.4.11_A2_T3'
  eq 'She sells seashells by the seashore.'replace(/sh/g, '$`sch'), 'She sells seaShe sells seaschells by the seaShe sells seashells by the seaschore.', 'S15.5.4.11_A2_T4'
  eq 'She sells seashells by the seashore.'replace(/sh/g, "$'sch"), 'She sells seaells by the seashore.schells by the seaore.schore.', 'S15.5.4.11_A2_T5'
  eq 'She sells seashells by the seashore.'replace(/sh/, \sch), 'She sells seaschells by the seashore.', 'S15.5.4.11_A2_T6'
  eq 'She sells seashells by the seashore.'replace(/sh/, \$$sch), 'She sells sea$schells by the seashore.', 'S15.5.4.11_A2_T7'
  eq 'She sells seashells by the seashore.'replace(/sh/, '$&sch'), 'She sells seashschells by the seashore.', 'S15.5.4.11_A2_T8'
  eq 'She sells seashells by the seashore.'replace(/sh/, '$`sch'), 'She sells seaShe sells seaschells by the seashore.', 'S15.5.4.11_A2_T9'
  eq 'She sells seashells by the seashore.'replace(/sh/, "$'sch"), 'She sells seaells by the seashore.schells by the seashore.', 'S15.5.4.11_A2_T10'
  eq 'uid=31'replace(/(uid=)(\d+)/, '$1115'), 'uid=115', 'S15.5.4.11_A3_T1'
  eq 'uid=31'replace(/(uid=)(\d+)/, '$11A15'), 'uid=1A15', 'S15.5.4.11_A3_T3'
  eq 'abc12 def34'replace(/([a-z]+)([0-9]+)/, -> &.2 + &.1), '12abc def34', 'S15.5.4.11_A4_T1'
  eq 'aaaaaaaaaa,aaaaaaaaaaaaaaa'replace(/^(a+)\1*,\1+$/, '$1'), \aaaaa, 'S15.5.4.11_A5_T1'

test 'RegExp#@@replace' !->
  ok typeof! /./[Symbol.replace] is \Function, 'RegExp#@@replace is function'
  eq /./[Symbol.replace].length, 2, 'RegExp#@@replace length is 2'
  eq /([a-z]+)([0-9]+)/[Symbol.replace]('abc12 def34', -> &.2 + &.1), '12abc def34'

test '@@replace logic' !->
  O = {(Symbol.replace): (a, b)-> {a, b}}
  eq 'qwe'replace(O, 42)a, \qwe
  eq 'qwe'replace(O, 42)b, 42
  eq ''replace.call(123, O, 42)a, 123
  eq ''replace.call(123, O, 42)b, 42
  re = /./
  re[Symbol.replace] = (a, b)-> {a, b}
  eq 'qwe'replace(re, 42)a, \qwe
  eq 'qwe'replace(re, 42)b, 42
  eq ''replace.call(123, re, 42)a, 123
  eq ''replace.call(123, re, 42)b, 42