{module, test} = QUnit
module 'core-js'

test 'String#escapeHTML' (assert)!->
  {escapeHTML} = core.String
  assert.isFunction escapeHTML
  assert.strictEqual escapeHTML('qwe, asd'), 'qwe, asd'
  assert.strictEqual escapeHTML('<div>qwe</div>'), '&lt;div&gt;qwe&lt;/div&gt;'
  assert.strictEqual escapeHTML("&<>\"'"), '&amp;&lt;&gt;&quot;&apos;'