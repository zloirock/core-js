QUnit.module \ES6

eq = strictEqual

test 'Reflect.has' !->
  {has} = core.Reflect
  ok typeof! has is \Function, 'Reflect.has is function'
  eq has.length, 2, 'arity is 2'
  if \name of has => eq has.name, \has, 'name is "has"'
  O = {qux: 987}
  eq has(O, \qux), on
  eq has(O, \qwe), no
  eq has(O, \toString), on
  throws (-> has 42, \constructor), TypeError, 'throws on primitive'