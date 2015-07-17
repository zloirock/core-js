QUnit.module \core-js
eq = strictEqual

test 'String#escapeHTML' !->
  ok typeof! String::escapeHTML is \Function, 'Is function'
  ok /native code/.test(String::escapeHTML), 'looks like native'
  eq String::escapeHTML.length, 0, 'arity is 0'
  if \name of String::escapeHTML => eq String::escapeHTML.name, \escapeHTML, 'name is "escapeHTML"'
  eq 'qwe, asd'escapeHTML!, 'qwe, asd'
  eq '<div>qwe</div>'escapeHTML!, '&lt;div&gt;qwe&lt;/div&gt;'
  eq "&<>\"'".escapeHTML!, '&amp;&lt;&gt;&quot;&apos;'