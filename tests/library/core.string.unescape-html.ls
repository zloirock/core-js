{module, test} = QUnit
module 'core-js'

test 'String#unescapeHTML' (assert)!->
  {unescapeHTML} = core.String
  assert.isFunction unescapeHTML
  assert.strictEqual unescapeHTML('qwe, asd'), 'qwe, asd'
  assert.strictEqual unescapeHTML('&lt;div&gt;qwe&lt;/div&gt;'), '<div>qwe</div>'
  assert.strictEqual unescapeHTML('&amp;&lt;&gt;&quot;&apos;'), "&<>\"'"