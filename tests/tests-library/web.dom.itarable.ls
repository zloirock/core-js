QUnit.module 'DOM iterable'

isFunction = -> typeof! it is \Function

if NodeList? and document?querySelectorAll and typeof! document.querySelectorAll(\div) is \NodeList
  test 'NodeList.prototype@@iterator' !->
    ok core.isIterable(document.querySelectorAll(\div)), 'Is iterable'

if HTMLCollection? and document?getElementsByTagName and typeof! document.getElementsByTagName(\div) is \HTMLCollection
  test 'HTMLCollection.prototype@@iterator' !->
    ok core.isIterable(document.getElementsByTagName(\div)), 'Is iterable' # Buggy in some Chromium versions