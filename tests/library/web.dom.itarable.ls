{module, test} = QUnit
module 'DOM iterable'

if NodeList? and document?querySelectorAll and typeof! document.querySelectorAll(\div) is \NodeList
  test 'NodeList.prototype@@iterator' (assert)->
    assert.ok core.isIterable(document.querySelectorAll(\div)), 'Is iterable'

if HTMLCollection? and document?getElementsByTagName and typeof! document.getElementsByTagName(\div) is \HTMLCollection
  test 'HTMLCollection.prototype@@iterator' (assert)->
    assert.ok core.isIterable(document.getElementsByTagName(\div)), 'Is iterable' # Buggy in some Chromium versions