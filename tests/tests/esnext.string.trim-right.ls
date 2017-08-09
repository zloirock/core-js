{module, test} = QUnit
module \ESNext

test 'String#trimRight' (assert)!->
  assert.isFunction ''trimRight
  assert.arity String::trimRight, 0
  assert.name String::trimRight, \trimRight
  assert.looksNative String::trimRight
  assert.nonEnumerable String::, \trimRight
  assert.strictEqual ' \n  q w e \n  'trimRight!, ' \n  q w e', 'removes whitespaces at right side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimRight!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trimRight!, '\u200b\u0085', "shouldn't remove this symbols"
  if STRICT
    assert.throws (!-> String::trimRight.call null, 0), TypeError
    assert.throws (!-> String::trimRight.call void, 0), TypeError

test 'String#trimEnd' (assert)!->
  assert.isFunction ''trimEnd
  assert.arity String::trimEnd, 0
  assert.name String::trimEnd, \trimRight
  assert.looksNative String::trimEnd
  assert.nonEnumerable String::, \trimEnd
  assert.same String::trimEnd, String::trimRight, 'same #trimRight'
  assert.strictEqual ' \n  q w e \n  'trimEnd!, ' \n  q w e', 'removes whitespaces at right side of string'
  assert.strictEqual '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'trimEnd!, '', 'removes all whitespaces'
  assert.strictEqual '\u200b\u0085'trimEnd!, '\u200b\u0085', "shouldn't remove this symbols"
  if STRICT
    assert.throws (!-> String::trimEnd.call null, 0), TypeError
    assert.throws (!-> String::trimEnd.call void, 0), TypeError