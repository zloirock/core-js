QUnit.module 'DOM iterable'

isFunction = -> typeof! it is \Function

if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
  test 'NodeList.prototype@@iterator' !->
    ok isFunction(document.querySelectorAll(\div)[Symbol.iterator]), 'Is function'

if HTMLCollection? and document?getElementsByTagName and document.getElementsByTagName(\div) instanceof HTMLCollection
  test 'HTMLCollection.prototype@@iterator' !->
    ok isFunction(document.getElementsByTagName(\div)[Symbol.iterator]), 'Is function' # Buggy in some Chromium versions