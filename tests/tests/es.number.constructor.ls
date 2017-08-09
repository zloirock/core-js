{module, test} = QUnit
module \ES

ws = ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'

$check = (assert)-> (a, b)!->
  assert.same Number(a), b, "Number #{typeof a} #a -> #b"
  x = new Number a
  assert.ok x is Object(x), "new Number #{typeof a} #a is object"
  assert.strictEqual typeof! x, \Number, "classof new Number #{typeof a} #a is Number"
  assert.same x.valueOf!, b, "new Number(#{typeof a} #a).valueOf() -> #b"

test 'Number constructor: regression' (assert)!->
  check = $check assert
  assert.isFunction Number
  assert.arity Number, 1
  assert.name Number, \Number
  assert.looksNative Number
  assert.same Number::constructor, Number
  assert.same 1.constructor, Number
  for <[MAX_VALUE MIN_VALUE NaN NEGATIVE_INFINITY POSITIVE_INFINITY]>
    assert.ok .. of Number, "Number.#{..}"
    assert.nonEnumerable Number, ..
  assert.same Number!, 0
  assert.same new Number!valueOf!, 0
  check 42, 42
  check 42.42, 42.42
  check new Number(42), 42
  check new Number(42.42), 42.42
  check \42, 42
  check '42.42', 42.42
  check \0x42, 66
  check \0X42, 66
  check \0xzzz, NaN
  check \0x1g, NaN
  check \+0x1, NaN
  check \-0x1, NaN
  check \+0X1, NaN
  check \-0X1, NaN
  check new String(\42), 42
  check new String('42.42'), 42.42
  check new String(\0x42), 66
  check null, 0
  check void, NaN
  check false, 0
  check true, 1
  check new Boolean(false), 0
  check new Boolean(true), 1
  check {}, NaN
  check {valueOf: '1.1'}, NaN
  check {valueOf: '1.1', toString: -> '2.2'}, 2.2
  check {valueOf: -> '1.1'}, 1.1
  check {valueOf: -> '1.1', toString: -> '2.2'}, 1.1
  check {valueOf: -> '-0x1a2b3c'}, NaN
  check {toString: -> '-0x1a2b3c'}, NaN
  check {valueOf: -> 42}, 42
  check {valueOf: -> \42}, 42
  check {valueOf: -> null}, 0
  check {toString: -> 42}, 42
  check {toString: -> \42}, 42
  check {valueOf: -> 1, toString: -> 2}, 1
  check {valueOf: 1, toString: -> 2}, 2
  i = 1
  assert.strictEqual Number(valueOf: -> ++i), 2, 'Number call valueOf only once #1'
  assert.strictEqual i, 2, 'Number call valueOf only once #2'
  i = 1
  assert.strictEqual Number(toString: -> ++i), 2, 'Number call toString only once #1'
  assert.strictEqual i, 2, 'Number call toString only once #2'
  i = 1
  assert.strictEqual new Number(valueOf: -> ++i).valueOf!, 2, 'new Number call valueOf only once #1'
  assert.strictEqual i, 2, 'new Number call valueOf only once #2'
  i = 1
  assert.strictEqual new Number(toString: -> ++i).valueOf!, 2, 'new Number call toString only once #1'
  assert.strictEqual i, 2, 'new Number call toString only once #2'
  assert.throws (-> Number Object.create null), TypeError, 'Number assert.throws on object w/o valueOf and toString'
  assert.throws (-> Number valueOf: 1, toString: 2), TypeError, 'Number assert.throws on object then valueOf and toString are not functions'
  assert.throws (-> new Number Object.create null), TypeError, 'new Number assert.throws on object w/o valueOf and toString'
  assert.throws (-> new Number valueOf: 1, toString: 2), TypeError, 'new Number assert.throws on object then valueOf and toString are not functions'
  n = new Number 42
  assert.strictEqual typeof n@@(n), \number
  check "#{ws}42", 42
  check "42#{ws}", 42
  check "#{ws}42#{ws}", 42
  check "#{ws}0x42", 66
  check "0x42#{ws}", 66
  check "#{ws}0x42#{ws}", 66
  check "#{ws}0X42", 66
  check "0X42#{ws}", 66
  check "#{ws}0X42#{ws}", 66
  if nativeSubclass
    C = nativeSubclass Number
    assert.ok new C instanceof C, 'correct subclassing with native classes #1'
    assert.ok new C instanceof Number, 'correct subclassing with native classes #2'
    assert.same new C(1).toFixed(2), '1.00', 'correct subclassing with native classes #3'

test 'Number constructor: binary' (assert)!->
  check = $check assert
  check \0b1, 1
  check \0B1, 1
  check \0b12, NaN
  check \0b234, NaN
  check '0b1!', NaN
  check \+0b1, NaN
  check \-0b1, NaN
  check ' 0b1', 1
  check '0b1\n', 1
  check '\n 0b1\n ', 1
  check ' 0B1', 1
  check '0B1\n', 1
  check '\n 0B1\n ', 1
  check {valueOf: -> \0b11}, 3
  check {toString: -> \0b111}, 7
  check {valueOf: -> \0b101010}, 42
  check {toString: -> \0b101010}, 42
  check "#{ws}0b11", 3
  check "0b11#{ws}", 3
  check "#{ws}0b11#{ws}", 3
  check "#{ws}0B11", 3
  check "0B11#{ws}", 3
  check "#{ws}0B11#{ws}", 3

test 'Number constructor: octal' (assert)!->
  check = $check assert
  check \0o7, 7
  check \0O7, 7
  check \0o18, NaN
  check \0o89a, NaN
  check '0o1!', NaN
  check \+0o1, NaN
  check \-0o1, NaN
  check ' 0o1', 1
  check '0o1\n', 1
  check '\n 0o1\n ', 1
  check ' 0O1', 1
  check '0O1\n', 1
  check '\n 0O1\n ', 1
  check {valueOf: -> \0o77}, 63
  check {toString: -> \0o777}, 511
  check {valueOf: -> \0o12345}, 5349
  check {toString: -> \0o12345}, 5349
  check "#{ws}0o11", 9
  check "0o11#{ws}", 9
  check "#{ws}0o11#{ws}", 9
  check "#{ws}0O11", 9
  check "0O11#{ws}", 9
  check "#{ws}0O11#{ws}", 9