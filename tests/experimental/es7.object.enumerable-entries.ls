{module, test} = QUnit
module \ES7

test 'Object.enumerableEntries ' (assert)!->
  {enumerableEntries , create} = Object
  assert.isFunction enumerableEntries 
  assert.arity enumerableEntries , 1
  assert.name enumerableEntries , \enumerableEntries 
  assert.looksNative enumerableEntries 
  assert.nonEnumerable Object, \enumerableEntries 
  O = create({a: 1}, {c: {value: 3}});
  O.b = 2;
  assert.deepEqual enumerableEntries(O)sort((x, y)-> x[1] - y[1]), [[\a 1], [\b 2]]