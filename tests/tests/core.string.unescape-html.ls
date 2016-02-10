{module, test} = QUnit
module \core-js

test 'String#unescapeHTML' (assert)!->
  assert.isFunction String::unescapeHTML
  assert.arity String::unescapeHTML, 0
  assert.name String::unescapeHTML, \unescapeHTML
  assert.looksNative String::unescapeHTML
  assert.strictEqual 'qwe, asd'.unescapeHTML!, 'qwe, asd'
  assert.strictEqual '&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML!, '<div>qwe</div>'
  assert.strictEqual '&amp;&lt;&gt;&quot;&apos;'.unescapeHTML!, "&<>\"'"