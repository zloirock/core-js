QUnit.module 'core-js String escape HTML'
isFunction = -> typeof! it is \Function
{escapeHTML, unescapeHTML} = core.String
test '#escapeHTML' !->
  ok isFunction(escapeHTML), 'Is function'
  ok escapeHTML('qwe, asd') is 'qwe, asd'
  ok escapeHTML('<div>qwe</div>') is '&lt;div&gt;qwe&lt;/div&gt;'
  ok escapeHTML("&<>\"'") is '&amp;&lt;&gt;&quot;&apos;'
test '#unescapeHTML' !->
  ok isFunction(unescapeHTML), 'Is function'
  ok unescapeHTML('qwe, asd') is 'qwe, asd'
  ok unescapeHTML('&lt;div&gt;qwe&lt;/div&gt;') is '<div>qwe</div>'
  ok unescapeHTML('&amp;&lt;&gt;&quot;&apos;') is "&<>\"'"