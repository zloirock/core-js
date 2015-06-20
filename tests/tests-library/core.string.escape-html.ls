QUnit.module 'core-js String#escapeHTML'

eq = strictEqual

test '*' !->
  {escapeHTML} = core.String
  ok typeof! escapeHTML is \Function, 'Is function'
  eq escapeHTML('qwe, asd'), 'qwe, asd'
  eq escapeHTML('<div>qwe</div>'), '&lt;div&gt;qwe&lt;/div&gt;'
  eq escapeHTML("&<>\"'"), '&amp;&lt;&gt;&quot;&apos;'