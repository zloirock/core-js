QUnit.module \core-js
eq = strictEqual

test 'String#unescapeHTML' !->
  ok typeof! String::unescapeHTML is \Function, 'Is function'
  ok /native code/.test(String::unescapeHTML), 'looks like native'
  eq String::unescapeHTML.length, 0, 'arity is 0'
  if \name of String::unescapeHTML => eq String::unescapeHTML.name, \unescapeHTML, 'name is "unescapeHTML"'
  eq 'qwe, asd'.unescapeHTML!, 'qwe, asd'
  eq '&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML!, '<div>qwe</div>'
  eq '&amp;&lt;&gt;&quot;&apos;'.unescapeHTML!, "&<>\"'"