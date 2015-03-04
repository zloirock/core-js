QUnit.module 'ES6 Number constructor'

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

check = (a, b)->
  sameEq Number(a), b, "Number #{typeof a} #a -> #b"
  x = new Number a
  ok x is Object(x), "new Number #{typeof a} #a is object"
  eq typeof! x, \Number, "classof new Number #{typeof a} #a is Number"
  sameEq x.valueOf!, b, "new Number(#{typeof a} #a).valueOf() -> #b"

test 'regression' !->
  ok typeof! Number is \Function, 'Number is function'
  eq Number.length, 1, 'Number.length is 1'
  if \name of Number => eq Number.name, \Number, 'Number.name is "Number" (can fail if compressed)'
  
  check 42, 42
  check 42.42, 42.42
  check new Number(42), 42
  check new Number(42.42), 42.42
  check \42, 42
  check '42.42', 42.42
  check \0x42, 66
  check \0X42, 66
  check \0xzzz, NaN
  check new String(\42), 42
  check new String('42.42'), 42.42
  check new String(\0x42), 66
  check null, 0
  check void, NaN
  check false, 0
  check true, 1
  check new Boolean(false), 0
  check new Boolean(true), 1
  check {valueOf: -> 42}, 42
  check {valueOf: -> \42}, 42
  check {valueOf: -> null}, 0
  check {toString: -> 42}, 42
  check {toString: -> \42}, 42
  check {valueOf: -> 1, toString: -> 2}, 1
  check {valueOf: 1, toString: -> 2}, 2
  i = 1
  eq Number(valueOf: -> ++i), 2, 'Number call valueOf only once #1'
  eq i, 2, 'Number call valueOf only once #2'
  i = 1
  eq Number(toString: -> ++i), 2, 'Number call toString only once #1'
  eq i, 2, 'Number call toString only once #2'
  i = 1
  eq new Number(valueOf: -> ++i).valueOf!, 2, 'new Number call valueOf only once #1'
  eq i, 2, 'new Number call valueOf only once #2'
  i = 1
  eq new Number(toString: -> ++i).valueOf!, 2, 'new Number call toString only once #1'
  eq i, 2, 'new Number call toString only once #2'
  throws (-> Number Object.create null), TypeError, 'Number throws on object w/o valueOf and toString'
  throws (-> Number valueOf: 1, toString: 2), TypeError, 'Number throws on object then valueOf and toString are not functions'
  throws (-> new Number Object.create null), TypeError, 'new Number throws on object w/o valueOf and toString'
  throws (-> new Number valueOf: 1, toString: 2), TypeError, 'new Number throws on object then valueOf and toString are not functions'
  
  for <[MAX_VALUE MIN_VALUE NaN NEGATIVE_INFINITY POSITIVE_INFINITY]>
    ok .. of Number, "#{..} in Number"

test \binary !->
  check \0b1, 1
  check \0B1, 1
  check \0b234, NaN
  check {valueOf: -> \0b11}, 3
  check {toString: -> \0b111}, 7

test \octal !->
  check \0o7, 7
  check \0O7, 7
  check \0o89a, NaN
  check {valueOf: -> \0o77}, 63
  check {toString: -> \0o777}, 511