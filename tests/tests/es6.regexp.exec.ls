QUnit.test 'RegExp#exec lastIndex updating', (assert) ->
  re = /b/
  assert.strictEqual re.lastIndex, 0, '.lastIndex starts at 0 for non-global regexps'
  re.exec 'abc'
  assert.strictEqual re.lastIndex, 0, '.lastIndex isn\'t updated for non-global regexps'
  re = /b/g
  assert.strictEqual re.lastIndex, 0, '.lastIndex starts at 0 for global regexps'
  re.exec 'abc'
  assert.strictEqual re.lastIndex, 2, '.lastIndex is updated for global regexps'
  re = /b*/
  re.exec 'a'
  assert.strictEqual re.lastIndex, 0, '.lastIndex isn\'t updated for non-global regexps if the match is empty'
  re = /b*/g
  re.exec 'a'
  assert.strictEqual re.lastIndex, 0, '.lastIndex isn\'t updated for global regexps if the match is empty'
  return 

QUnit.test 'RegExp#exec capturing groups', (assert) ->
  assert.deepEqual (/(a?)/.exec 'x'), ['', ''], '/(a?)/.exec("x") returns ["", ""]'
  assert.deepEqual (/(a)?/.exec 'x'), ['', void], '/(a)?/.exec("x") returns ["", undefined]'
  return 