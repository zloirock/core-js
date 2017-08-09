{module, test} = QUnit
module \ES

test 'Object.getOwnPropertyNames' (assert)!->
  {getOwnPropertyNames} = core.Object
  assert.isFunction getOwnPropertyNames
  assert.arity getOwnPropertyNames, 1
  fn1 = (@w = 2)->
  fn2 = (@toString = 2)->
  fn1::q = fn2::q = 1
  names = getOwnPropertyNames [1 2 3]
  assert.strictEqual names.length, 4
  assert.ok \0 in names
  assert.ok \1 in names
  assert.ok \2 in names
  assert.ok \length in names
  assert.deepEqual getOwnPropertyNames(new fn1 1), <[w]>
  assert.deepEqual getOwnPropertyNames(new fn2 1), <[toString]>
  assert.ok \toString in getOwnPropertyNames Array::
  assert.ok \toString in getOwnPropertyNames Object::
  assert.ok \constructor in getOwnPropertyNames Object::
  for value in [42 \foo no]
    assert.ok (try => getOwnPropertyNames value; on), "accept #{typeof! value}"
  for value in [null void]
    assert.throws (!-> getOwnPropertyNames value), TypeError, "throws on #value"
  if document?
    assert.ok (try 
      iframe = document.createElement \iframe
      iframe.src = 'http://example.com'
      document.documentElement.appendChild iframe
      w = iframe.contentWindow
      document.documentElement.removeChild iframe
      getOwnPropertyNames w
    ), 'IE11 bug with iframe and window'