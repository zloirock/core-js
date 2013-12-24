{isFunction} = Object
test 'String::trimLeft' ->
  ok isFunction String::trimLeft
  ok '   123   'trimLeft! is '123   '
  ok '   \nasd\n   'trimLeft! is 'asd\n   '
test 'String::trimRight' ->
  ok isFunction String::trimRight
  ok '   123   'trimRight! is '   123'
  ok '   \nasd\n   'trimRight! is '   \nasd'
test 'String::escapeHTML' ->
  ok isFunction String::escapeHTML
  ok 'qwe, asd'escapeHTML! is 'qwe, asd'
  ok '<div>qwe</div>'escapeHTML! is '&lt;div&gt;qwe&lt;&#x2f;div&gt;'
  ok "&<>\"'/"escapeHTML! is '&amp;&lt;&gt;&quot;&apos;&#x2f;'
test 'String::unescapeHTML' ->
  ok isFunction String::unescapeHTML
  ok 'qwe, asd'unescapeHTML! is 'qwe, asd'
  ok '&lt;div&gt;qwe&lt;&#x2f;div&gt;'unescapeHTML! is '<div>qwe</div>'
  ok '&amp;&lt;&gt;&quot;&apos;&#x2f;'unescapeHTML! is "&<>\"'/"
test 'String::escapeURL' ->
  ok isFunction String::escapeURL
  # TODO
test 'String::unescapeURL' ->
  ok isFunction String::unescapeURL
  # TODO
test 'String::escapeRegExp' ->
  ok isFunction String::escapeRegExp
  ok 'qwe asd'escapeRegExp! is 'qwe asd'
  ok '\\/\'*+?|()[]{}.^$'escapeRegExp! is "\\\\\\/\\'\\*\\+\\?\\|\\(\\)\\[\\]\\{\\}\\.\\^\\$"
test 'String::reverse' ->
  ok isFunction String::reverse
  ok ' qwerty 'reverse! is ' ytrewq '
test 'String::at' ->
  ok isFunction String::at
  ok ''at(-1) is ''
  ok ''at(void) is ''
  ok 'qwerty'at(0) is \q
  ok 'qwerty'at(5) is \y
  ok 'qwerty'at(-1) is \y
  ok 'qwerty'at(-6) is \q
  ok 'qwerty'at(6) is ''
  ok 'qwerty'at(-7) is ''