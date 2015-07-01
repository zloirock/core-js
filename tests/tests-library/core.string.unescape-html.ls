QUnit.module 'core-js'

eq = strictEqual

test 'String#unescapeHTML' !->
  {unescapeHTML} = core.String
  ok typeof! unescapeHTML is \Function, 'Is function'
  eq unescapeHTML('qwe, asd'), 'qwe, asd'
  eq unescapeHTML('&lt;div&gt;qwe&lt;/div&gt;'), '<div>qwe</div>'
  eq unescapeHTML('&amp;&lt;&gt;&quot;&apos;'), "&<>\"'"