{module, test} = QUnit
module 'DOM iterable'

if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
  test 'NodeList.prototype@@iterator' (assert)->
    assert.isFunction document.querySelectorAll(\div)[Symbol.iterator]

if HTMLCollection? and document?getElementsByTagName and document.getElementsByTagName(\div) instanceof HTMLCollection
  test 'HTMLCollection.prototype@@iterator' (assert)->
    assert.isFunction document.getElementsByTagName(\div)[Symbol.iterator] # Buggy in some Chromium versions