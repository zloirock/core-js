{module, test} = QUnit
module \ES7

test 'Object.enumerableValues ' (assert)!->
  {enumerableValues , create} = Object
  assert.isFunction enumerableValues 
  assert.arity enumerableValues , 1
  assert.name enumerableValues , \enumerableValues 
  assert.looksNative enumerableValues 
  assert.nonEnumerable Object, \enumerableValues 
  O = create({a: 1}, {c: {value: 3}});
  O.b = 2;
  assert.deepEqual enumerableValues(O)sort!, [1 2]