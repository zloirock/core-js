{module, test} = QUnit
module \ES

test 'String#match regression' (assert)->
  assert.isFunction ''match
  assert.arity ''match, 1
  assert.name ''match, \match
  assert.looksNative ''match
  assert.nonEnumerable String::, \match
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/match
  instance = Object on
  instance.match = String::match
  assert.strictEqual instance.match(on).0, \true, 'S15.5.4.10_A1_T1'
  instance = Object no;
  instance.match = String::match
  assert.strictEqual instance.match((-> no)!).0, \false, 'S15.5.4.10_A1_T2'
  matched = ''match!
  expected = RegExp!exec ''
  assert.strictEqual matched.length, expected.length, 'S15.5.4.10_A1_T4 #1'
  assert.strictEqual matched.index, expected.index, 'S15.5.4.10_A1_T4 #2'
  assert.strictEqual matched.input, expected.input, 'S15.5.4.10_A1_T4 #3'
  assert.strictEqual 'gnulluna'match(null).0, \null, 'S15.5.4.10_A1_T5'
  matched = Object(\undefined).match x
  expected = RegExp(x)exec \undefined
  assert.strictEqual matched.length, expected.length, 'S15.5.4.10_A1_T6 #1'
  assert.strictEqual matched.index, expected.index, 'S15.5.4.10_A1_T6 #2'
  assert.strictEqual matched.input, expected.input, 'S15.5.4.10_A1_T6 #3'
  matched = String(\undefined)match undefined
  expected = RegExp(undefined)exec \undefined
  assert.strictEqual matched.length, expected.length, 'S15.5.4.10_A1_T7 #1'
  assert.strictEqual matched.index, expected.index, 'S15.5.4.10_A1_T7 #2'
  assert.strictEqual matched.input, expected.input, 'S15.5.4.10_A1_T7 #3'
  obj = {toString: ->}
  matched = String(obj)match void
  expected = RegExp(void)exec \undefined
  assert.strictEqual matched.length, expected.length, 'S15.5.4.10_A1_T8 #1'
  assert.strictEqual matched.index, expected.index, 'S15.5.4.10_A1_T8 #2'
  assert.strictEqual matched.input, expected.input, 'S15.5.4.10_A1_T8 #3'
  obj = {toString: -> '\u0041B'}
  str = 'ABB\u0041BABAB'
  assert.strictEqual str.match(obj).0, \AB, 'S15.5.4.10_A1_T10'
  obj = {toString: -> throw \intostr}
  str = 'ABB\u0041BABAB'
  try
    x = str.match obj
    assert.ok no, 'S15.5.4.10_A1_T11 #1 lead to throwing exception'
  catch e
    assert.strictEqual e, \intostr, 'S15.5.4.10_A1_T11 #1.1: Exception === "intostr". Actual: ' + e
  obj = {toString: (-> {}),valueOf: -> throw \intostr}
  str = 'ABB\u0041BABAB'
  try
    x = str.match obj
    assert.ok no, 'S15.5.4.10_A1_T12 #1 lead to throwing exception'
  catch e
    assert.strictEqual e, \intostr, 'S15.5.4.10_A1_T12 #1.1: Exception === "intostr". Actual: ' + e
  obj = {toString: (-> {}),valueOf: -> 1}
  assert.strictEqual 'ABB\u0041B\u0031ABAB\u0031BBAA'match(obj).0, \1, 'S15.5.4.10_A1_T13 #1'
  assert.strictEqual 'ABB\u0041B\u0031ABAB\u0031BBAA'match(obj).length, 1, 'S15.5.4.10_A1_T13 #2'
  reg = RegExp \77
  assert.strictEqual 'ABB\u0041BABAB\u0037\u0037BBAA'match(reg).0, \77, 'S15.5.4.10_A1_T14'
  string = \1234567890
  assert.strictEqual string.match(3).0, \3, 'S15.5.4.10_A2_T1 #1'
  assert.strictEqual string.match(3)length, 1, 'S15.5.4.10_A2_T1 #2'
  assert.strictEqual string.match(3)index, 2, 'S15.5.4.10_A2_T1 #3'
  assert.strictEqual string.match(3)input, string, 'S15.5.4.10_A2_T1 #4'
  matches = <[34 34 34]>
  string = \343443444
  assert.strictEqual string.match(/34/g)length, 3, 'S15.5.4.10_A2_T2 #1'
  for i in matches
    assert.strictEqual string.match(/34/g)[i], matches[i], "S15.5.4.10_A2_T2 #2"
  matches = <[1 2 3 4 5 6 7 8 9 0]>
  string = \123456abcde7890
  assert.strictEqual string.match(/\d{1}/g).length, 10, 'S15.5.4.10_A2_T3 #1'
  for i in matches
    assert.strictEqual string.match(/\d{1}/g)[i], matches[i], "S15.5.4.10_A2_T3 #2"
  matches = <[12 34 56 78 90]>
  string = \123456abcde7890
  assert.strictEqual string.match(/\d{2}/g).length, 5, 'S15.5.4.10_A2_T4 #1'
  for i in matches
    assert.strictEqual string.match(/\d{2}/g)[i], matches[i], "S15.5.4.10_A2_T4 #2"
  matches = <[ab cd]>
  string = \123456abcde7890
  assert.strictEqual string.match(/\D{2}/g).length, 2, 'S15.5.4.10_A2_T5 #1'
  for i in matches
    assert.strictEqual string.match(/\D{2}/g)[i], matches[i], "S15.5.4.10_A2_T5 #2"
  string = "Boston, Mass. 02134"
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).0, \02134, 'S15.5.4.10_A2_T6 #1'
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).1, \02134, 'S15.5.4.10_A2_T6 #2'
  NATIVE and assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/).2, void, 'S15.5.4.10_A2_T6 #3' #fails in old IE
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)length, 3, 'S15.5.4.10_A2_T6 #4'
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)index, 14, 'S15.5.4.10_A2_T6 #5'
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/)input, string, 'S15.5.4.10_A2_T6 #6'
  string = "Boston, Mass. 02134"
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/g).length, 1, 'S15.5.4.10_A2_T7 #1'
  assert.strictEqual string.match(/([\d]{5})([-\ ]?[\d]{4})?$/g).0, \02134, 'S15.5.4.10_A2_T7 #2'
  matches = <[02134 02134 undefined]>
  string = "Boston, MA 02134"
  re = /([\d]{5})([-\ ]?[\d]{4})?$/
  re.lastIndex = 0
  assert.strictEqual string.match(re).length, 3, 'S15.5.4.10_A2_T8 #1'
  assert.strictEqual string.match(re).index, string.lastIndexOf(\0), 'S15.5.4.10_A2_T8 #2'
  for i in matches
    assert.strictEqual string.match(re)[i], matches[i], "S15.5.4.10_A2_T8 #3"
  string = "Boston, MA 02134"
  matches = [\02134 \02134 void]
  re = /([\d]{5})([-\ ]?[\d]{4})?$/
  re.lastIndex = string.length
  assert.strictEqual string.match(re).length, 3, 'S15.5.4.10_A2_T9 #1'
  assert.strictEqual string.match(re).index, string.lastIndexOf(\0), 'S15.5.4.10_A2_T9 #2'
  for i in matches
    assert.strictEqual string.match(re)[i], matches[i], "S15.5.4.10_A2_T9 #3"
  string = "Boston, MA 02134"
  matches = [\02134 \02134 void]
  re = /([\d]{5})([-\ ]?[\d]{4})?$/
  re.lastIndex = string.lastIndexOf \0
  assert.strictEqual string.match(re).length, 3, 'S15.5.4.10_A2_T10 #1'
  assert.strictEqual string.match(re).index, string.lastIndexOf(\0), 'S15.5.4.10_A2_T10 #2'
  for i in matches
    assert.strictEqual string.match(re)[i], matches[i], "S15.5.4.10_A2_T10 #3"
  string = "Boston, MA 02134";
  matches = [\02134 \02134 void]
  re = /([\d]{5})([-\ ]?[\d]{4})?$/
  re.lastIndex = string.lastIndexOf(\0) + 1
  assert.strictEqual string.match(re).length, 3, 'S15.5.4.10_A2_T11 #1'
  assert.strictEqual string.match(re).index, string.lastIndexOf(\0), 'S15.5.4.10_A2_T11 #2'
  for i in matches
    assert.strictEqual string.match(re)[i], matches[i], "S15.5.4.10_A2_T11 #3"
  string = "Boston, MA 02134"
  re = /([\d]{5})([-\ ]?[\d]{4})?$/g
  assert.strictEqual string.match(re).length, 1, 'S15.5.4.10_A2_T12 #1'
  assert.strictEqual string.match(re).0, \02134, 'S15.5.4.10_A2_T12 #2'
  re = /([\d]{5})([-\ ]?[\d]{4})?$/g
  re.lastIndex = 0;
  string = "Boston, MA 02134"
  assert.strictEqual string.match(re).length, 1, 'S15.5.4.10_A2_T13 #1'
  assert.strictEqual string.match(re).0, \02134, 'S15.5.4.10_A2_T13 #2'
  string = "Boston, MA 02134"
  re = /([\d]{5})([-\ ]?[\d]{4})?$/g
  re.lastIndex = string.length
  assert.strictEqual string.match(re).length, 1, 'S15.5.4.10_A2_T14 #1'
  assert.strictEqual string.match(re).0, \02134, 'S15.5.4.10_A2_T14 #2'
  string = "Boston, MA 02134"
  re = /([\d]{5})([-\ ]?[\d]{4})?$/g
  re.lastIndex = string.lastIndexOf \0
  assert.strictEqual string.match(re).length, 1, 'S15.5.4.10_A2_T15 #1'
  assert.strictEqual string.match(re).0, \02134, 'S15.5.4.10_A2_T15 #2'
  string = "Boston, MA 02134"
  re = /([\d]{5})([-\ ]?[\d]{4})?$/g
  re.lastIndex = string.lastIndexOf(\0) + 1
  assert.strictEqual string.match(re).length, 1, 'S15.5.4.10_A2_T16 #1'
  assert.strictEqual string.match(re).0, \02134, 'S15.5.4.10_A2_T16 #2'
  re = /0./
  num = 10203040506070809000
  assert.strictEqual ''match.call(num, re)[0], \02, 'S15.5.4.10_A2_T17 #1'
  assert.strictEqual ''match.call(num, re)length, 1, 'S15.5.4.10_A2_T17 #2'
  assert.strictEqual ''match.call(num, re)index, 1, 'S15.5.4.10_A2_T17 #3'
  assert.strictEqual ''match.call(num, re)input, String(num), 'S15.5.4.10_A2_T17 #4'
  re = /0./
  re.lastIndex = 0
  num = 10203040506070809000
  assert.strictEqual ''match.call(num, re)[0], \02, 'S15.5.4.10_A2_T18 #1'
  assert.strictEqual ''match.call(num, re)length, 1, 'S15.5.4.10_A2_T18 #2'
  assert.strictEqual ''match.call(num, re)index, 1, 'S15.5.4.10_A2_T18 #3'
  assert.strictEqual ''match.call(num, re)input, String(num), 'S15.5.4.10_A2_T18 #4'

test 'RegExp#@@match' (assert)->
  assert.isFunction /./[Symbol?match]
  assert.arity /./[Symbol?match], 1
  string = "Boston, MA 02134"
  matches = [\02134 \02134 void]
  assert.strictEqual /([\d]{5})([-\ ]?[\d]{4})?$/[Symbol?match](string).length, 3
  assert.strictEqual /([\d]{5})([-\ ]?[\d]{4})?$/[Symbol?match](string).index, string.lastIndexOf \0
  for i in matches
    assert.strictEqual /([\d]{5})([-\ ]?[\d]{4})?$/[Symbol?match](string)[i], matches[i]

test '@@match logic' (assert)->
  'use strict'
  str = if STRICT => \qwe else Object \qwe
  num = if STRICT => 123 else Object 123
  O = {(Symbol?match): -> {value: it}}
  assert.strictEqual str.match(O)value, str
  assert.strictEqual ''match.call(num, O)value, num
  re = /./
  re[Symbol?match] = -> {value: it}
  assert.strictEqual str.match(re)value, str
  assert.strictEqual ''match.call(num, re)value, num
  