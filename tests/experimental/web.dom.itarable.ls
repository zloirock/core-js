{module, test} = QUnit
module 'DOM iterable'

test 'Iterable DOM collections' (assert)->
  absent = on;
  for <[CSSRuleList CSSStyleDeclaration DOMStringList DOMTokenList FileList HTMLCollection MediaList MimeTypeArray NamedNodeMap NodeList NodeListOf Plugin PluginArray StyleSheetList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[Symbol?toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction Collection::[Symbol?iterator], "#{..}::@@iterator is function"
      absent = no
  if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
    assert.isFunction document.querySelectorAll(\div)[Symbol.iterator], 'works with document.querySelectorAll'
  if HTMLCollection? and document?getElementsByTagName and document.getElementsByTagName(\div) instanceof HTMLCollection
    assert.isFunction document.getElementsByTagName(\div)[Symbol.iterator], 'works with document.getElementsByTagName'
  if absent => assert.ok on, 'DOM collections are absent'