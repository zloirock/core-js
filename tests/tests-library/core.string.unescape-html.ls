QUnit.module 'core-js String#unescapeHTML'

eq = strictEqual

test '*' !->
  {unescapeHTML} = core.String
  ok typeof! unescapeHTML is \Function, 'Is function'
  eq unescapeHTML('qwe, asd'), 'qwe, asd'
  eq unescapeHTML('&lt;div&gt;qwe&lt;/div&gt;'), '<div>qwe</div>'
  eq unescapeHTML('&amp;&lt;&gt;&quot;&apos;'), "&<>\"'"