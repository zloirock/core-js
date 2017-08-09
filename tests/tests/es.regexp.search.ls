{module, test} = QUnit
module \ES

test 'String#search regression' (assert)->
  assert.isFunction ''search
  assert.arity ''search, 1
  assert.name ''search, \search
  assert.looksNative ''search
  assert.nonEnumerable String::, \search
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/search
  instance = Object on
  instance.search = String::search
  assert.strictEqual instance.search(on), 0, 'S15.5.4.12_A1_T1'
  instance = Object no
  instance.search = String::search
  assert.strictEqual instance.search(no), 0, 'S15.5.4.12_A1_T2'
  assert.strictEqual ''search!, 0, 'S15.5.4.12_A1_T4 #1'
  assert.strictEqual '--undefined--'search!, 0, 'S15.5.4.12_A1_T4 #2'
  assert.strictEqual 'gnulluna'search(null), 1, 'S15.5.4.12_A1_T5'
  assert.strictEqual Object(\undefined)search(void), 0, 'S15.5.4.12_A1_T6'
  assert.strictEqual 'undefined'search(void), 0, 'S15.5.4.12_A1_T7'
  assert.strictEqual String({toString: ->})search(void), 0, 'S15.5.4.12_A1_T8'
  assert.strictEqual 'ssABB\u0041BABAB'search({toString: -> '\u0041B'}), 2, 'S15.5.4.12_A1_T10'
  try
    'ABB\u0041BABAB'search {toString: ->  throw \intostr}
    assert.ok no, 'S15.5.4.12_A1_T11 #1 lead to throwing exception'
  catch e
    assert.strictEqual e, \intostr, 'S15.5.4.12_A1_T11 #2'
  try
    Object('ABB\u0041BABAB')search {toString: (-> {}), valueOf: -> throw \intostr}
    assert.ok no, 'S15.5.4.12_A1_T12 #1 lead to throwing exception'
  catch e
    assert.strictEqual e, \intostr, 'S15.5.4.12_A1_T12 #2'
  assert.strictEqual 'ABB\u0041B\u0031ABAB\u0031BBAA'search({toString: (-> {}), valueOf: -> 1}), 5, 'S15.5.4.12_A1_T13'
  assert.strictEqual 'ABB\u0041BABAB\u0037\u0037BBAA'search(RegExp \77), 9, 'S15.5.4.12_A1_T14'
  assert.strictEqual Object('test string')search(\string), 5, 'S15.5.4.12_A2_T1'
  assert.strictEqual Object('test string')search(\String), -1, 'S15.5.4.12_A2_T2'
  assert.strictEqual Object('test string')search(/String/i), 5, 'S15.5.4.12_A2_T3'
  assert.strictEqual Object('test string')search(/Four/), -1, 'S15.5.4.12_A2_T4'
  assert.strictEqual Object('one two three four five')search(/four/), 14, 'S15.5.4.12_A2_T5'
  assert.strictEqual Object('test string')search(\notexist), -1, 'S15.5.4.12_A2_T6'
  assert.strictEqual Object('test string probe')search('string pro'), 5, 'S15.5.4.12_A2_T7'
  aString = Object 'power of the power of the power of the power of the power of the power of the great sword'
  assert.strictEqual aString.search(/the/), aString.search(/the/g), 'S15.5.4.12_A3_T1'
  aString = Object 'power \u006F\u0066 the power of the power \u006F\u0066 the power of the power \u006F\u0066 the power of the great sword'
  assert.strictEqual aString.search(/of/), aString.search(/of/g), 'S15.5.4.12_A3_T2'

test 'RegExp#@@search' (assert)->
  assert.isFunction /./[Symbol?search]
  assert.arity /./[Symbol?search], 1
  assert.strictEqual /four/[Symbol?search]('one two three four five'), 14
  assert.strictEqual /Four/[Symbol?search]('one two three four five'), -1

test '@@search logic' (assert)->
  'use strict'
  str = if STRICT => \qwe else Object \qwe
  num = if STRICT => 123 else Object 123
  O = {(Symbol?search): -> {value: it}}
  assert.strictEqual str.search(O)value, str
  assert.strictEqual ''search.call(num, O)value, num
  re = /./
  re[Symbol?search] = -> {value: it}
  assert.strictEqual str.search(re)value, str
  assert.strictEqual ''search.call(num, re)value, num
  