QUnit.module \ES6

eq = strictEqual

test 'String#split regression' !->
  ok typeof! ''split is \Function, 'String#split is function'
  eq ''split.length, 2, 'String#split length is 2'
  ok /native code/.test(''split), 'looks like native'
  if \name of ''split => eq ''split.name, \split, 'String#split is "split" (can fail if compressed)'
  # based on https://github.com/tc39/test262/tree/master/test/built-ins/String/prototype/split
  instance = Object on
  instance.split = String::split
  split = instance.split on, no
  eq typeof split, \object, 'S15.5.4.14_A1_T1 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T1 #2'
  eq split.length, 0, 'S15.5.4.14_A1_T1 #3'
  instance = Object no
  instance.split = String::split
  split = instance.split no, 0, null
  eq typeof split, \object, 'S15.5.4.14_A1_T2 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T2 #2'
  eq split.length, 0, 'S15.5.4.14_A1_T2 #3'
  split = ''split!
  eq typeof split, \object, 'S15.5.4.14_A1_T4 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T4 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T4 #3'
  eq split.0, '', 'S15.5.4.14_A1_T4 #4'
  split = 'gnulluna'split null
  eq typeof split, \object, 'S15.5.4.14_A1_T5 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T5 #2'
  eq split.length, 2, 'S15.5.4.14_A1_T5 #3'
  eq split.0, \g, 'S15.5.4.14_A1_T5 #4'
  eq split.1, \una, 'S15.5.4.14_A1_T5 #5'
  /* wrong behavior in some old browsers
  split = Object(\1undefined)split void
  eq typeof split, \object, 'S15.5.4.14_A1_T6 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T6 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T6 #3'
  eq split.0, \1undefined, 'S15.5.4.14_A1_T6 #4'
  split = 'undefinedd'split void
  eq typeof split, \object, 'S15.5.4.14_A1_T7 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T7 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T7 #3'
  eq split.0, \undefinedd, 'S15.5.4.14_A1_T7 #4'
  split = String({toString: ->})split void
  eq typeof split, \object, 'S15.5.4.14_A1_T8 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T8 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T8 #3'
  eq split.0, \undefined, 'S15.5.4.14_A1_T8 #4'
  */
  split = new String({valueOf: (->), toString: void})split ->
  eq typeof split, \object, 'S15.5.4.14_A1_T9 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T9 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T9 #3'
  eq split.0, \undefined, 'S15.5.4.14_A1_T9 #4'
  split = 'ABB\u0041BABAB'split {toString: -> '\u0042B'}, {valueOf: -> on}
  eq typeof split, \object, 'S15.5.4.14_A1_T10 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T10 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T10 #3'
  eq split.0, \A, 'S15.5.4.14_A1_T10 #4'
  try
    'ABB\u0041BABAB'split {toString: -> '\u0041B'}, {valueOf: throw \intointeger}
    ok no, 'S15.5.4.14_A1_T11 #1 lead to throwing exception'
  catch e
    eq e, \intointeger, 'S15.5.4.14_A1_T11 #2'
  /* wrong behavior in old IE
  try
    new String('ABB\u0041BABAB')split {toString: -> '\u0041B'}, {valueOf: (-> {}), toString: -> throw \intointeger}
    ok no, 'S15.5.4.14_A1_T12 #1 lead to throwing exception'
  catch e
    eq e, \intointeger, 'S15.5.4.14_A1_T12 #2'
  */
  split = 'ABB\u0041BABAB\u0042cc^^\u0042Bvv%%B\u0042xxx'split {toString: -> '\u0042\u0042'}, {valueOf: (-> {}), toString: -> \2}
  eq typeof split, \object, 'S15.5.4.14_A1_T13 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T13 #2'
  eq split.length, 2, 'S15.5.4.14_A1_T13 #3'
  eq split.0, \A, 'S15.5.4.14_A1_T13 #4'
  eq split.1, \ABABA, 'S15.5.4.14_A1_T13 #5'
  /* wrong behavior in old IE
  try
    instance = Object 10001.10001
    instance.split = String::split
    instance.split {toString: -> throw \intostr}, {valueOf: -> throw \intoint}
    ok no, 'S15.5.4.14_A1_T14 #1 lead to throwing exception'
  catch e
    eq e, \intoint, 'S15.5.4.14_A1_T14 #2'
  try
    class F
      costructor: (@value)->
      valueOf: -> ''+@value
      toString: -> new Number
      split: String::split
    new F!split {toString: (-> {}), valueOf: -> throw \intostr}, {valueOf: -> throw \intoint}
    ok no, 'S15.5.4.14_A1_T15 #1 lead to throwing exception'
  catch e
    eq e, \intoint, 'S15.5.4.14_A1_T15 #2'
  */
  try
    String::split.call 6776767677.006771122677555, {toString: -> /\u0037\u0037/g}
    ok no, 'S15.5.4.14_A1_T16 #1 lead to throwing exception'
  catch e
    ok e instanceof TypeError, 'S15.5.4.14_A1_T16 #2'
  split = String::split.call 6776767677.006771122677555, /\u0037\u0037/g
  eq typeof split, \object, 'S15.5.4.14_A1_T17 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T17 #2'
  eq split.length, 4, 'S15.5.4.14_A1_T17 #3'
  eq split.0, \6, 'S15.5.4.14_A1_T17 #4'
  eq split.1, \67676, 'S15.5.4.14_A1_T17 #5'
  eq split.2, '.006', 'S15.5.4.14_A1_T17 #6'
  eq split.3, \1, 'S15.5.4.14_A1_T17 #7'
  split = String::split.call 6776767677.006771122677555, /00/, 1
  eq typeof split, \object, 'S15.5.4.14_A1_T18 #1'
  eq split@@, Array, 'S15.5.4.14_A1_T18 #2'
  eq split.length, 1, 'S15.5.4.14_A1_T18 #3'
  eq split.0, '6776767677.', 'S15.5.4.14_A1_T18 #4'
  split = Object('one,two,three,four,five')split \,
  eq split@@, Array, 'S15.5.4.14_A2_T1 #1'
  eq split.length, 5, 'S15.5.4.14_A2_T1 #2'
  eq split.0, \one, 'S15.5.4.14_A2_T1 #3'
  eq split.1, \two, 'S15.5.4.14_A2_T1 #4'
  eq split.2, \three, 'S15.5.4.14_A2_T1 #5'
  eq split.3, \four, 'S15.5.4.14_A2_T1 #6'
  eq split.4, \five, 'S15.5.4.14_A2_T1 #7'
  split = Object('one two three four five')split ' '
  eq split@@, Array, 'S15.5.4.14_A2_T2 #1'
  eq split.length, 5, 'S15.5.4.14_A2_T2 #2'
  eq split.0, \one, 'S15.5.4.14_A2_T2 #3'
  eq split.1, \two, 'S15.5.4.14_A2_T2 #4'
  eq split.2, \three, 'S15.5.4.14_A2_T2 #5'
  eq split.3, \four, 'S15.5.4.14_A2_T2 #6'
  eq split.4, \five, 'S15.5.4.14_A2_T2 #7'
  split = Object('one two three four five')split RegExp(' '), 2
  eq split@@, Array, 'S15.5.4.14_A2_T3 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T3 #2'
  eq split.0, \one, 'S15.5.4.14_A2_T3 #3'
  eq split.1, \two, 'S15.5.4.14_A2_T3 #4'
  split = Object('one two three')split ''
  eq split@@, Array, 'S15.5.4.14_A2_T4 #1'
  eq split.length, 'one two three'length, 'S15.5.4.14_A2_T4 #2'
  eq split.0, \o, 'S15.5.4.14_A2_T4 #3'
  eq split.1, \n, 'S15.5.4.14_A2_T4 #4'
  eq split.11, \e, 'S15.5.4.14_A2_T4 #5'
  eq split.12, \e, 'S15.5.4.14_A2_T4 #6'
  split = Object('one-1,two-2,four-4')split /,/
  eq split@@, Array, 'S15.5.4.14_A2_T5 #1'
  eq split.length, 3, 'S15.5.4.14_A2_T5 #2'
  eq split.0, 'one-1', 'S15.5.4.14_A2_T5 #3'
  eq split.1, 'two-2', 'S15.5.4.14_A2_T5 #4'
  eq split.2, 'four-4', 'S15.5.4.14_A2_T5 #5'
  string = Object 'one-1 two-2 three-3'
  split = string.split ''
  eq split@@, Array, 'S15.5.4.14_A2_T6 #1'
  eq split.length, string.length, 'S15.5.4.14_A2_T6 #2'
  for i til split.length
    eq split[i], string.charAt(i), "S15.5.4.14_A2_T6 #" + (i + 3)
  /* wrong behavior in some old browsers
  string = 'thisundefinedisundefinedaundefinedstringundefinedobject'
  split = string.split void
  eq split@@, Array, 'S15.5.4.14_A2_T7 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T7 #2'
  eq split.0, string, 'S15.5.4.14_A2_T7 #3'
  */
  string = \thisnullisnullanullstringnullobject
  expected = <[this is a string object]>
  split = string.split null
  eq split@@, Array, 'S15.5.4.14_A2_T8 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T8 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T8 #" + (i + 3)
  string = \thistrueistrueatruestringtrueobject
  expected = <[this is a string object]>
  split = string.split true
  eq split@@, Array, 'S15.5.4.14_A2_T9 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T9 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T9 #" + (i + 3)
  string = \this123is123a123string123object
  expected = <[this is a string object]>
  split = string.split 123
  eq split@@, Array, 'S15.5.4.14_A2_T10 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T10 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T10 #" + (i + 3)
  split = Object('one-1,two-2,four-4')split ':'
  eq split@@, Array, 'S15.5.4.14_A2_T11 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T11 #2'
  eq split.0, 'one-1,two-2,four-4', 'S15.5.4.14_A2_T11 #3'
  split = Object('one-1 two-2 four-4')split 'r-42'
  eq split@@, Array, 'S15.5.4.14_A2_T12 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T12 #2'
  eq split.0, 'one-1 two-2 four-4', 'S15.5.4.14_A2_T12 #3'
  split = Object('one-1 two-2 four-4')split '-4'
  eq split@@, Array, 'S15.5.4.14_A2_T13 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T13 #2'
  eq split.0, 'one-1 two-2 four', 'S15.5.4.14_A2_T13 #3'
  eq split.1, '', 'S15.5.4.14_A2_T13 #4'
  split = Object('one-1 two-2 four-4')split \on
  eq split@@, Array, 'S15.5.4.14_A2_T14 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T14 #2'
  eq split.0, '', 'S15.5.4.14_A2_T14 #3'
  eq split.1, 'e-1 two-2 four-4', 'S15.5.4.14_A2_T14 #4'
  split = new String!split ''
  eq split@@, Array, 'S15.5.4.14_A2_T15 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T15 #2'
  eq split.0, void, 'S15.5.4.14_A2_T15 #3'
  split = new String!split ' '
  eq split@@, Array, 'S15.5.4.14_A2_T16 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T16 #2'
  eq split.0, '', 'S15.5.4.14_A2_T16 #3'
  split = Object(' ')split ''
  eq split@@, Array, 'S15.5.4.14_A2_T18 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T18 #2'
  eq split.0, ' ', 'S15.5.4.14_A2_T18 #3'
  split = Object(' ')split ' '
  eq split@@, Array, 'S15.5.4.14_A2_T19 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T19 #2'
  eq split.0, '', 'S15.5.4.14_A2_T19 #3'
  eq split.1, '', 'S15.5.4.14_A2_T19 #4'
  split = ''split \x
  eq split@@, Array, 'S15.5.4.14_A2_T19 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T19 #2'
  eq split.0, '', 'S15.5.4.14_A2_T19 #3'
  string = Object 'one-1 two-2 three-3'
  split = string.split new RegExp
  eq split@@, Array, 'S15.5.4.14_A2_T20 #1'
  eq split.length, string.length, 'S15.5.4.14_A2_T20 #2'
  for i til split.length
    eq split[i], string.charAt(i), "S15.5.4.14_A2_T20 #" + (i + 3)
  split = Object(\hello)split \ll
  eq split@@, Array, 'S15.5.4.14_A2_T21 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T21 #2'
  eq split.0, \he, 'S15.5.4.14_A2_T21 #3'
  eq split.1, \o, 'S15.5.4.14_A2_T21 #4'
  split = Object(\hello)split \l
  eq split@@, Array, 'S15.5.4.14_A2_T22 #1'
  eq split.length, 3, 'S15.5.4.14_A2_T22 #2'
  eq split.0, \he, 'S15.5.4.14_A2_T22 #3'
  eq split.1, '', 'S15.5.4.14_A2_T22 #4'
  eq split.2, \o, 'S15.5.4.14_A2_T22 #5'
  split = Object(\hello)split \x
  eq split@@, Array, 'S15.5.4.14_A2_T23 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T23 #2'
  eq split.0, \hello, 'S15.5.4.14_A2_T23 #3'
  split = Object(\hello)split \h
  eq split@@, Array, 'S15.5.4.14_A2_T24 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T24 #2'
  eq split.0, '', 'S15.5.4.14_A2_T24 #3'
  eq split.1, \ello, 'S15.5.4.14_A2_T24 #4'
  split = Object(\hello)split \o
  eq split@@, Array, 'S15.5.4.14_A2_T25 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T25 #2'
  eq split.0, \hell, 'S15.5.4.14_A2_T25 #3'
  eq split.1, '', 'S15.5.4.14_A2_T25 #4'
  split = Object(\hello)split \hello
  eq split@@, Array, 'S15.5.4.14_A2_T26 #1'
  eq split.length, 2, 'S15.5.4.14_A2_T26 #2'
  eq split.0, '', 'S15.5.4.14_A2_T26 #3'
  eq split.1, '', 'S15.5.4.14_A2_T26 #4'
  split = Object(\hello)split void
  eq split@@, Array, 'S15.5.4.14_A2_T27 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T27 #2'
  eq split.0, \hello, 'S15.5.4.14_A2_T27 #3'
  split = Object(\hello)split \hellothere
  eq split@@, Array, 'S15.5.4.14_A2_T28 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T28 #2'
  eq split.0, \hello, 'S15.5.4.14_A2_T28 #3'
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1
  expected = ['' \00 '' '' '' \22 \33 \44 \60]
  eq split@@, Array, 'S15.5.4.14_A2_T29 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T29 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T29 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 1
  expected = ['']
  eq split@@, Array, 'S15.5.4.14_A2_T30 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T30 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T30 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 2
  expected = ['' \00]
  eq split@@, Array, 'S15.5.4.14_A2_T31 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T31 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T31 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 0
  eq split@@, Array, 'S15.5.4.14_A2_T32 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T32 #2'
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 100
  expected = ['' \00 '' '' '' \22 \33 \44 \60]
  eq split@@, Array, 'S15.5.4.14_A2_T33 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T33 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T33 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 void
  expected = ['' \00 '' '' '' \22 \33 \44 \60]
  eq split@@, Array, 'S15.5.4.14_A2_T34 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T34 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T34 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 Math.pow(2 32) - 1
  expected = ['' \00 '' '' '' \22 \33 \44 \60]
  eq split@@, Array, 'S15.5.4.14_A2_T35 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T35 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T35 #" + (i + 3)
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 \boo
  eq split@@, Array, 'S15.5.4.14_A2_T36 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T36 #2'
  /* wrong behavior in most browsers
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1, -Math.pow(2 32) + 1
  eq split@@, Array, 'S15.5.4.14_A2_T37 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T37 #2'
  */
  instance = Object 100111122133144155
  instance.split = String::split
  split = instance.split 1 NaN
  eq split@@, Array, 'S15.5.4.14_A2_T38 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T38 #2'
  instance = Object(\hello)split \l 0
  eq split@@, Array, 'S15.5.4.14_A2_T39 #1'
  eq split.length, 0, 'S15.5.4.14_A2_T39 #2'
  split = Object(\hello)split \l 1
  eq split@@, Array, 'S15.5.4.14_A2_T40 #1'
  eq split.length, 1, 'S15.5.4.14_A2_T40 #2'
  eq split.0, \he, 'S15.5.4.14_A2_T40 #3'
  split = Object(\hello)split \l 2
  expected = [\he '']
  eq split@@, Array, 'S15.5.4.14_A2_T41 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T41 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T41 #" + (i + 3)
  split = Object(\hello)split \l 3
  expected = [\he '' \o]
  eq split@@, Array, 'S15.5.4.14_A2_T42 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T42 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T42 #" + (i + 3)
  split = Object(\hello)split \l 4
  expected = [\he '' \o]
  eq split@@, Array, 'S15.5.4.14_A2_T43 #1'
  eq split.length, expected.length, 'S15.5.4.14_A2_T43 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A2_T43 #" + (i + 3)
  split = Object('one,two,three,four,five')split!
  eq split@@, Array, 'S15.5.4.14_A3_T1 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T1 #2'
  eq split.0, 'one,two,three,four,five', 'S15.5.4.14_A3_T1 #3'
  split = String::split.call {}
  eq split@@, Array, 'S15.5.4.14_A3_T2 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T2 #2'
  eq split.0, '[object Object]', 'S15.5.4.14_A3_T2 #3'
  split = String::split.call {toString: -> 'function(){}'}
  eq split@@, Array, 'S15.5.4.14_A3_T3 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T3 #2'
  eq split.0, 'function(){}', 'S15.5.4.14_A3_T3 #3'
  split = String::split.call Object NaN
  eq split@@, Array, 'S15.5.4.14_A3_T4 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T4 #2'
  eq split.0, \NaN, 'S15.5.4.14_A3_T4 #3'
  split = String::split.call Object -1234567890
  eq split@@, Array, 'S15.5.4.14_A3_T5 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T5 #2'
  eq split.0, '-1234567890', 'S15.5.4.14_A3_T5 #3'
  instance = Object -1e21
  split = String::split.call instance
  eq split@@, Array, 'S15.5.4.14_A3_T6 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T6 #2'
  eq split.0, instance.toString!, 'S15.5.4.14_A3_T6 #3'
  split = String::split.call Math
  eq split@@, Array, 'S15.5.4.14_A3_T7 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T7 #2'
  eq split.0, '[object Math]', 'S15.5.4.14_A3_T7 #3'
  split = String::split.call [1 2 3 4 5]
  eq split@@, Array, 'S15.5.4.14_A3_T8 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T8 #2'
  eq split.0, '1,2,3,4,5', 'S15.5.4.14_A3_T8 #3'
  split = String::split.call Object no
  eq split@@, Array, 'S15.5.4.14_A3_T9 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T9 #2'
  eq split.0, \false, 'S15.5.4.14_A3_T9 #3'
  split = String::split.call new String
  eq split@@, Array, 'S15.5.4.14_A3_T10 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T10 #2'
  eq split.0, '', 'S15.5.4.14_A3_T10 #3'
  split = String::split.call Object ' '
  eq split@@, Array, 'S15.5.4.14_A3_T11 #1'
  eq split.length, 1, 'S15.5.4.14_A3_T11 #2'
  eq split.0, ' ', 'S15.5.4.14_A3_T11 #3'
  /* wrong behavior in old IE
  split = Object(\hello)split /l/
  eq split@@, Array, 'S15.5.4.14_A4_T1 #1'
  eq split.length, 3, 'S15.5.4.14_A4_T1 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T1 #3'
  eq split.1, '', 'S15.5.4.14_A4_T1 #4'
  eq split.2, 'o', 'S15.5.4.14_A4_T1 #5'
  */
  split = Object(\hello)split /l/, 0
  eq split@@, Array, 'S15.5.4.14_A4_T2 #1'
  eq split.length, 0, 'S15.5.4.14_A4_T2 #2'
  split = Object(\hello)split /l/, 1
  eq split@@, Array, 'S15.5.4.14_A4_T3 #1'
  eq split.length, 1, 'S15.5.4.14_A4_T3 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T3 #3'
  /* wrong behavior in old IE
  split = Object(\hello)split /l/, 2
  eq split@@, Array, 'S15.5.4.14_A4_T4 #1'
  eq split.length, 2, 'S15.5.4.14_A4_T4 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T4 #3'
  eq split.1, '', 'S15.5.4.14_A4_T4 #4'
  split = Object(\hello)split /l/, 3
  eq split@@, Array, 'S15.5.4.14_A4_T5 #1'
  eq split.length, 3, 'S15.5.4.14_A4_T5 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T5 #3'
  eq split.1, '', 'S15.5.4.14_A4_T5 #4'
  eq split.2, 'o', 'S15.5.4.14_A4_T5 #5'
  split = Object(\hello)split /l/, 4
  eq split@@, Array, 'S15.5.4.14_A4_T6 #1'
  eq split.length, 3, 'S15.5.4.14_A4_T6 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T6 #3'
  eq split.1, '', 'S15.5.4.14_A4_T6 #4'
  eq split.2, 'o', 'S15.5.4.14_A4_T6 #5'
  split = Object(\hello)split /l/, void
  eq split@@, Array, 'S15.5.4.14_A4_T7 #1'
  eq split.length, 3, 'S15.5.4.14_A4_T7 #2'
  eq split.0, 'he', 'S15.5.4.14_A4_T7 #3'
  eq split.1, '', 'S15.5.4.14_A4_T7 #4'
  eq split.2, 'o', 'S15.5.4.14_A4_T7 #5'
  */
  split = Object(\hello)split /l/, \hi
  eq split@@, Array, 'S15.5.4.14_A4_T8 #1'
  eq split.length, 0, 'S15.5.4.14_A4_T8 #2'
  split = Object(\hello)split new RegExp
  expected = <[h e l l o]>
  eq split@@, Array, 'S15.5.4.14_A4_T10 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T10 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T10 #" + (i + 3)
  split = Object(\hello)split new RegExp!, 0
  eq split@@, Array, 'S15.5.4.14_A4_T11 #1'
  eq split.length, 0, 'S15.5.4.14_A4_T11 #2'
  split = Object(\hello)split new RegExp!, 1
  eq split@@, Array, 'S15.5.4.14_A4_T12 #1'
  eq split.length, 1, 'S15.5.4.14_A4_T12 #2'
  eq split.0, \h, 'S15.5.4.14_A4_T12 #3'
  split = Object(\hello)split new RegExp!, 2
  expected = <[h e]>
  eq split@@, Array, 'S15.5.4.14_A4_T13 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T13 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T13 #" + (i + 3)
  split = Object(\hello)split new RegExp!, 3
  expected = <[h e l]>
  eq split@@, Array, 'S15.5.4.14_A4_T14 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T14 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T14 #" + (i + 3)
  split = Object(\hello)split new RegExp!, 4
  expected = <[h e l l]>
  eq split@@, Array, 'S15.5.4.14_A4_T15 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T15 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T15 #" + (i + 3)
  split = Object(\hello)split new RegExp!, void
  expected = <[h e l l o]>
  eq split@@, Array, 'S15.5.4.14_A4_T16 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T16 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T16 #" + (i + 3)
  split = Object(\hello)split new RegExp!, \hi
  eq split@@, Array, 'S15.5.4.14_A4_T18 #1'
  eq split.length, 0, 'S15.5.4.14_A4_T18 #2'
  split = Object('a b c de f')split /\s/
  expected = <[a b c de f]>
  eq split@@, Array, 'S15.5.4.14_A4_T19 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T19 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T19 #" + (i + 3)
  split = Object('a b c de f')split /\s/, 3
  expected = <[a b c]>
  eq split@@, Array, 'S15.5.4.14_A4_T20 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T20 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T20 #" + (i + 3)
  split = Object('a b c de f')split /X/
  eq split@@, Array, 'S15.5.4.14_A4_T21 #1'
  eq split.length, 1, 'S15.5.4.14_A4_T21 #2'
  eq split.0, 'a b c de f', "S15.5.4.14_A4_T21 #3"
  split = Object('dfe23iu 34 =+65--')split /\d+/
  expected = ['dfe' 'iu ' ' =+' '--']
  eq split@@, Array, 'S15.5.4.14_A4_T22 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T22 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T22 #" + (i + 3)
  /* wrong behavior in old IE
  split = Object(\abc)split /[a-z]/
  expected = ['' '' '' '']
  eq split@@, Array, 'S15.5.4.14_A4_T24 #1'
  eq split.length, expected.length, 'S15.5.4.14_A4_T24 #2'
  for i til expected.length
    eq expected[i], split[i], "S15.5.4.14_A4_T24 #" + (i + 3)
  */

test 'RegExp#@@split' !->
  ok typeof! /./[Symbol.split] is \Function, 'RegExp#@@split is function'
  eq /./[Symbol.split].length, 2, 'RegExp#@@split length is 2'
  eq /\s/[Symbol.split]('a b c de f').length, 5
  eq /\s/[Symbol.split]('a b c de f' void).length, 5
  eq /\s/[Symbol.split]('a b c de f' 1).length, 1
  eq /\s/[Symbol.split]('a b c de f' 10).length, 5

test '@@split logic' !->
  O = {(Symbol.split): (a, b)-> {a, b}}
  eq 'qwe'split(O, 42)a, \qwe
  eq 'qwe'split(O, 42)b, 42
  eq ''split.call(123, O, 42)a, \123
  eq ''split.call(123, O, 42)b, 42
  re = /./
  re[Symbol.split] = (a, b)-> {a, b}
  eq 'qwe'split(re, 42)a, \qwe
  eq 'qwe'split(re, 42)b, 42
  eq ''split.call(123, re, 42)a, \123
  eq ''split.call(123, re, 42)b, 42
  