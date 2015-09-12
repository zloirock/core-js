{module, test} = QUnit
module \core-js

test 'String#unescapeHTML' (assert)->
  assert.ok typeof! String::unescapeHTML is \Function, 'Is function'
  assert.ok /native code/.test(String::unescapeHTML), 'looks like native'
  assert.strictEqual String::unescapeHTML.length, 0, 'arity is 0'
  assert.strictEqual String::unescapeHTML.name, \unescapeHTML, 'name is "unescapeHTML"'
  assert.strictEqual 'qwe, asd'.unescapeHTML!, 'qwe, asd'
  assert.strictEqual '&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML!, '<div>qwe</div>'
  assert.strictEqual '&amp;&lt;&gt;&quot;&apos;'.unescapeHTML!, "&<>\"'"