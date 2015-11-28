{module, test} = QUnit
module 'Web'

test 'Iterable DOM collections' (assert)->
  absent = on;
  for <[NodeList DOMTokenList MediaList StyleSheetList CSSRuleList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[core.Symbol.toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction core.getIteratorMethod(Collection::), "#{..}::@@iterator is function"
      absent = no
  if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
    assert.isFunction core.getIteratorMethod(document.querySelectorAll(\div)), 'works with document.querySelectorAll'
  if absent => assert.ok on, 'DOM collections are absent'