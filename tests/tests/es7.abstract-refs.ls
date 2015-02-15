QUnit.module 'ES7 Abstract References'
eq = strictEqual
isFunction = -> typeof! it is \Function
test 'Symbols' !->
  ok \referenceGet of Symbol
  ok \referenceSet of Symbol
  ok \referenceDelete of Symbol
test 'Function#@@referenceGet' !->
  ok isFunction Function::[Symbol?referenceGet]
  fn = -> 42
  eq fn[Symbol?referenceGet](null), fn
  eq fn[Symbol?referenceGet]({}), fn
  eq fn[Symbol?referenceGet](O = {}).call(O), 42
test 'Map#@@referenceGet' !->
  ok isFunction Map::[Symbol?referenceGet]
  map = new Map [[O = {}, 42]]
  eq map[Symbol?referenceGet](O), 42
test 'Map#@@referenceSet' !->
  ok isFunction Map::[Symbol?referenceSet]
  map = new Map
  map[Symbol?referenceSet](O = {}, 42)
  eq map.get(O), 42
test 'Map#@@referenceDelete' !->
  ok isFunction Map::[Symbol?referenceDelete]
  map = new Map [[O = {}, 42]]
  map[Symbol?referenceDelete](O)
  eq map.get(O), void
test 'WeakMap#@@referenceGet' !->
  ok isFunction WeakMap::[Symbol?referenceGet]
  map = new WeakMap [[O = {}, 42]]
  eq map[Symbol?referenceGet](O), 42
test 'WeakMap#@@referenceSet' !->
  ok isFunction WeakMap::[Symbol?referenceSet]
  map = new WeakMap
  map[Symbol?referenceSet](O = {}, 42)
  eq map.get(O), 42
test 'WeakMap#@@referenceDelete' !->
  ok isFunction WeakMap::[Symbol?referenceDelete]
  map = new WeakMap [[O = {}, 42]]
  map[Symbol?referenceDelete](O)
  eq map.get(O), void