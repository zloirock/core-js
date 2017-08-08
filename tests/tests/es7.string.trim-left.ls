{module, test} = QUnit
module 'ESNext'

test 'String#trimLeft' (assert)!->
  assert.isFunction ''trimLeft
  assert.arity String::trimLeft, 0
  assert.name String::trimLeft, \trimLeft
  assert.looksNative String::trimLeft
  assert.nonEnumerable String::, \trimLeft
  assert.strictEqual ' \n  q w e \n  'trimLeft!, 'q w e \n  ', 'removes whitespaces at left side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimLeft!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trimLeft!, '\u200b\u0085', "shouldn't remove this symbols"
  if STRICT
    assert.throws (!-> String::trimLeft.call null, 0), TypeError
    assert.throws (!-> String::trimLeft.call void, 0), TypeError

test 'String#trimStart' (assert)!->
  assert.isFunction ''trimStart
  assert.arity String::trimStart, 0
  assert.name String::trimStart, \trimLeft
  assert.looksNative String::trimStart
  assert.nonEnumerable String::, \trimStart
  assert.same String::trimStart, String::trimLeft, 'same #trimLeft'
  assert.strictEqual ' \n  q w e \n  'trimStart!, 'q w e \n  ', 'removes whitespaces at left side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimStart!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trimStart!, '\u200b\u0085', "shouldn't remove this symbols"
  if STRICT
    assert.throws (!-> String::trimStart.call null, 0), TypeError
    assert.throws (!-> String::trimStart.call void, 0), TypeError