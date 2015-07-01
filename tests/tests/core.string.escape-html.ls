QUnit.module \core-js
eq = strictEqual

test 'String#escapeHTML' !->
  ok typeof! String::escapeHTML is \Function, 'Is function'
  eq 'qwe, asd'escapeHTML!, 'qwe, asd'
  eq '<div>qwe</div>'escapeHTML!, '&lt;div&gt;qwe&lt;/div&gt;'
  eq "&<>\"'".escapeHTML!, '&amp;&lt;&gt;&quot;&apos;'