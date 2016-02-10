{module, test} = QUnit
module \core-js

test 'String#escapeHTML' (assert)!->
  assert.isFunction String::escapeHTML
  assert.arity String::escapeHTML, 0
  assert.name String::escapeHTML, \escapeHTML
  assert.looksNative String::escapeHTML
  assert.strictEqual 'qwe, asd'escapeHTML!, 'qwe, asd'
  assert.strictEqual '<div>qwe</div>'escapeHTML!, '&lt;div&gt;qwe&lt;/div&gt;'
  assert.strictEqual "&<>\"'".escapeHTML!, '&amp;&lt;&gt;&quot;&apos;'