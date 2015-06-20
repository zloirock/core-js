QUnit.module 'ES6 Reflect.has'

eq = strictEqual

test '*' !->
  {has} = Reflect
  ok typeof! has is \Function, 'Reflect.has is function'
  eq has.length, 2, 'arity is 2'
  ok /native code/.test(has), 'looks like native'
  if \name of has => eq has.name, \has, 'name is "has"'
  O = {qux: 987}
  eq has(O, \qux), on
  eq has(O, \qwe), no
  eq has(O, \toString), on
  throws (-> has 42, \constructor), TypeError, 'throws on primitive'