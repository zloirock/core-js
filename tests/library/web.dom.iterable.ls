{module, test} = QUnit
module 'Web'

test 'Iterable DOM collections' (assert)->
  absent = on;
  for <[CSSRuleList CSSStyleDeclaration DOMStringList DOMTokenList FileList HTMLCollection MediaList MimeTypeArray NamedNodeMap NodeList NodeListOf Plugin PluginArray StyleSheetList TouchList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[core.Symbol.toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction core.getIteratorMethod(Collection::), "#{..}::@@iterator is function"
      absent = no
  if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
    assert.isFunction core.getIteratorMethod(document.querySelectorAll(\div)), 'works with document.querySelectorAll'
  if HTMLCollection? and document?getElementsByTagName and document.getElementsByTagName(\div) instanceof HTMLCollection
    assert.isFunction core.getIteratorMethod(document.getElementsByTagName(\div)), 'works with document.getElementsByTagName'
  if absent => assert.ok on, 'DOM collections are absent'