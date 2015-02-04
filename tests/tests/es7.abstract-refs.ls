QUnit.module 'ES7 Abstract References'
eq = strictEqual
isFunction = -> typeof! it is \Function
{referenceGet, referenceSet, referenceDelete} = Symbol
test 'Symbols' !->
  ok \referenceGet of Symbol
  ok \referenceSet of Symbol
  ok \referenceDelete of Symbol
test 'Function#@@referenceGet' !->
  ok isFunction Function::[referenceGet]
  fn = -> 42
  eq fn[referenceGet](null), fn
  eq fn[referenceGet]({}), fn
  eq fn[referenceGet](O = {}).call(O), 42
test 'Map#@@referenceGet' !->
  ok isFunction Map::[referenceGet]
  map = new Map [[O = {}, 42]]
  eq map[referenceGet](O), 42
test 'Map#@@referenceSet' !->
  ok isFunction Map::[referenceSet]
  map = new Map
  map[referenceSet](O = {}, 42)
  eq map.get(O), 42
test 'Map#@@referenceDelete' !->
  ok isFunction Map::[referenceDelete]
  map = new Map [[O = {}, 42]]
  map[referenceDelete](O)
  eq map.get(O), void
test 'WeakMap#@@referenceGet' !->
  ok isFunction WeakMap::[referenceGet]
  map = new WeakMap [[O = {}, 42]]
  eq map[Symbol.referenceGet](O), 42
test 'WeakMap#@@referenceSet' !->
  ok isFunction WeakMap::[referenceSet]
  map = new WeakMap
  map[referenceSet](O = {}, 42)
  eq map.get(O), 42
test 'WeakMap#@@referenceDelete' !->
  ok isFunction WeakMap::[referenceDelete]
  map = new WeakMap [[O = {}, 42]]
  map[referenceDelete](O)
  eq map.get(O), void