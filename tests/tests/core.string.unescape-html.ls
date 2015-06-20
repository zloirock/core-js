QUnit.module 'core-js String#unescapeHTML'

eq = strictEqual

test '*' !->
  ok typeof! String::unescapeHTML is \Function, 'Is function'
  eq 'qwe, asd'.unescapeHTML!, 'qwe, asd'
  eq '&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML!, '<div>qwe</div>'
  eq '&amp;&lt;&gt;&quot;&apos;'.unescapeHTML!, "&<>\"'"