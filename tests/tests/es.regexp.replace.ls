{module, test} = QUnit
module \ES

test 'String#replace regression' (assert)->
  assert.isFunction ''replace
  assert.arity ''replace, 2
  assert.name ''replace, \replace
  assert.looksNative ''replace
  assert.nonEnumerable String::, \replace
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/replace
  instance = Object true
  instance.replace = String::replace
  assert.strictEqual instance.replace(on, 1), \1, 'S15.5.4.11_A1_T1'
  instance = Object no
  instance.replace = String::replace
  assert.strictEqual instance.replace(no, void), \undefined, 'S15.5.4.11_A1_T2'
  assert.strictEqual 'gnulluna'replace(null, (a1, a2, a3)-> a2 + ''), \g1una, 'S15.5.4.11_A1_T4'
  assert.strictEqual 'gnulluna'replace(null, ->), \gundefineduna, 'S15.5.4.11_A1_T5'
  assert.strictEqual Object(\undefined)replace(void, -> &[1] + 42), \42, 'S15.5.4.11_A1_T6'
  assert.strictEqual 'undefined'replace(\e, void), \undundefinedfined, 'S15.5.4.11_A1_T7'
  assert.strictEqual String({toString: ->})replace(/e/g, void), \undundefinedfinundefinedd, 'S15.5.4.11_A1_T8'
  assert.strictEqual new String({valueOf: (->), toString: void})replace((->)!, (a1, a2, a3)-> a1 + a2 + a3), \undefined0undefined, 'S15.5.4.11_A1_T9'
  assert.strictEqual 'ABB\u0041BABAB'replace({toString: -> '\u0041B'}, ->), \undefinedBABABAB, 'S15.5.4.11_A1_T10'
  if NATIVE # wrong order in some old environments
    try
      'ABB\u0041BABAB'replace {toString: -> throw \insearchValue}, {toString: -> throw \inreplaceValue}
      assert.ok no, 'S15.5.4.11_A1_T11 #1 lead to throwing exception'
    catch e
      assert.strictEqual e, \insearchValue, 'S15.5.4.11_A1_T11 #2'
    try
      Object('ABB\u0041BABAB')replace {toString: (->{}), valueOf: -> throw \insearchValue}, {toString: -> throw \inreplaceValue}
      assert.ok no, 'S15.5.4.11_A1_T12 #1 lead to throwing exception'
    catch e
      assert.strictEqual e, \insearchValue, 'S15.5.4.11_A1_T12 #2'
  try
    'ABB\u0041BABAB\u0031BBAA'replace {toString: (->{}), valueOf: -> throw \insearchValue}, {toString: -> 1}
    assert.ok no, 'S15.5.4.11_A1_T13 #1 lead to throwing exception'
  catch e
    assert.strictEqual e, \insearchValue, 'S15.5.4.11_A1_T13 #2'
  assert.strictEqual 'ABB\u0041BABAB\u0037\u0037BBAA'replace(new RegExp(\77), 1), 'ABBABABAB\u0031BBAA', 'S15.5.4.11_A1_T14'
  instance = Object 1100.00777001
  instance.replace = String::replace
  try
    instance.replace {toString: -> /77/}, 1
    assert.ok no, 'S15.5.4.11_A1_T15 #1 lead to throwing exception'
  catch e
    assert.ok e instanceof TypeError, 'S15.5.4.11_A1_T15 #2'
  instance = Object 1100.00777001
  instance.replace = String::replace
  try
    instance.replace /77/, {toString: -> (a1, a2, a3)-> a2 + \z}
    assert.ok no, 'S15.5.4.11_A1_T16 #1 lead to throwing exception'
  catch e
    assert.ok e instanceof TypeError, 'S15.5.4.11_A1_T16 #2'
  assert.strictEqual 'asdf'replace(RegExp('' \g), \1), \1a1s1d1f1, 'S15.5.4.11_A1_T17'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/g, \sch), 'She sells seaschells by the seaschore.', 'S15.5.4.11_A2_T1'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/g, \$$sch), 'She sells sea$schells by the sea$schore.', 'S15.5.4.11_A2_T2'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/g, '$&sch'), 'She sells seashschells by the seashschore.', 'S15.5.4.11_A2_T3'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/g, '$`sch'), 'She sells seaShe sells seaschells by the seaShe sells seashells by the seaschore.', 'S15.5.4.11_A2_T4'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/g, "$'sch"), 'She sells seaells by the seashore.schells by the seaore.schore.', 'S15.5.4.11_A2_T5'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/, \sch), 'She sells seaschells by the seashore.', 'S15.5.4.11_A2_T6'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/, \$$sch), 'She sells sea$schells by the seashore.', 'S15.5.4.11_A2_T7'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/, '$&sch'), 'She sells seashschells by the seashore.', 'S15.5.4.11_A2_T8'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/, '$`sch'), 'She sells seaShe sells seaschells by the seashore.', 'S15.5.4.11_A2_T9'
  assert.strictEqual 'She sells seashells by the seashore.'replace(/sh/, "$'sch"), 'She sells seaells by the seashore.schells by the seashore.', 'S15.5.4.11_A2_T10'
  assert.strictEqual 'uid=31'replace(/(uid=)(\d+)/, '$1115'), 'uid=115', 'S15.5.4.11_A3_T1'
  assert.strictEqual 'uid=31'replace(/(uid=)(\d+)/, '$11A15'), 'uid=1A15', 'S15.5.4.11_A3_T3'
  assert.strictEqual 'abc12 def34'replace(/([a-z]+)([0-9]+)/, -> &.2 + &.1), '12abc def34', 'S15.5.4.11_A4_T1'
  assert.strictEqual 'aaaaaaaaaa,aaaaaaaaaaaaaaa'replace(/^(a+)\1*,\1+$/, '$1'), \aaaaa, 'S15.5.4.11_A5_T1'

test 'RegExp#@@replace' (assert)->
  assert.isFunction /./[Symbol?replace]
  assert.arity /./[Symbol?replace], 2
  assert.strictEqual /([a-z]+)([0-9]+)/[Symbol?replace]('abc12 def34', -> &.2 + &.1), '12abc def34'

test '@@replace logic' (assert)->
  'use strict'
  str = if STRICT => \qwe else Object \qwe
  num = if STRICT => 123 else Object 123
  O = {(Symbol?replace): (a, b)-> {a, b}}
  assert.strictEqual str.replace(O, 42)a, str
  assert.strictEqual str.replace(O, 42)b, 42
  assert.strictEqual ''replace.call(num, O, 42)a, num
  assert.strictEqual ''replace.call(num, O, 42)b, 42
  re = /./
  re[Symbol?replace] = (a, b)-> {a, b}
  assert.strictEqual str.replace(re, 42)a, str
  assert.strictEqual str.replace(re, 42)b, 42
  assert.strictEqual ''replace.call(num, re, 42)a, num
  assert.strictEqual ''replace.call(num, re, 42)b, 42