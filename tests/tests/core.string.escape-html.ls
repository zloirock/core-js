{module, test} = QUnit
module \core-js

test 'String#escapeHTML' (assert)->
  assert.ok typeof! String::escapeHTML is \Function, 'is function'
  assert.ok /native code/.test(String::escapeHTML), 'looks like native'
  assert.strictEqual String::escapeHTML.length, 0, 'arity is 0'
  assert.strictEqual String::escapeHTML.name, \escapeHTML, 'name is "escapeHTML"'
  assert.strictEqual 'qwe, asd'escapeHTML!, 'qwe, asd'
  assert.strictEqual '<div>qwe</div>'escapeHTML!, '&lt;div&gt;qwe&lt;/div&gt;'
  assert.strictEqual "&<>\"'".escapeHTML!, '&amp;&lt;&gt;&quot;&apos;'