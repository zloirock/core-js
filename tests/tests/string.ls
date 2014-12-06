QUnit.module \String
isFunction = -> typeof! it is \Function
test '#escapeHTML' !->
  ok isFunction(String::escapeHTML), 'Is function'
  ok 'qwe, asd'escapeHTML! is 'qwe, asd'
  ok '<div>qwe</div>'escapeHTML! is '&lt;div&gt;qwe&lt;/div&gt;'
  ok "&<>\"'".escapeHTML! is '&amp;&lt;&gt;&quot;&apos;'
test '#unescapeHTML' !->
  ok isFunction(String::unescapeHTML), 'Is function'
  ok 'qwe, asd'.unescapeHTML! is 'qwe, asd'
  ok '&lt;div&gt;qwe&lt;/div&gt;'.unescapeHTML! is '<div>qwe</div>'
  ok '&amp;&lt;&gt;&quot;&apos;'.unescapeHTML! is "&<>\"'"