{module, test} = QUnit
module \ES7

test 'Object.enumerableKeys' (assert)!->
  {enumerableKeys, create} = Object
  assert.isFunction enumerableKeys
  assert.arity enumerableKeys, 1
  assert.name enumerableKeys, \enumerableKeys
  assert.looksNative enumerableKeys
  assert.nonEnumerable Object, \enumerableKeys
  O = create({a: 1}, {c: {value: 3}});
  O.b = 2;
  assert.deepEqual enumerableKeys(O)sort!, <[a b]>