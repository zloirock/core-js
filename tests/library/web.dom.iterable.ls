{module, test} = QUnit
module 'Web'

test 'Iterable DOM collections' (assert)!->
  absent = on;
  for <[CSSRuleList CSSStyleDeclaration CSSValueList ClientRectList DOMRectList
    DOMStringList DOMTokenList DataTransferItemList FileList HTMLAllCollection
    HTMLCollection HTMLFormElement HTMLSelectElement MediaList
    MimeTypeArray NamedNodeMap NodeList PaintRequestList Plugin PluginArray SVGLengthList
    SVGNumberList SVGPathSegList SVGPointList SVGStringList SVGTransformList
    SourceBufferList StyleSheetList TextTrackCueList TextTrackList TouchList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[core.Symbol.toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction core.getIteratorMethod(Collection::), "#{..}::@@iterator is function"
      absent = no
  if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
    assert.isFunction core.getIteratorMethod(document.querySelectorAll(\div)), 'works with document.querySelectorAll'
  if absent => assert.ok on, 'DOM collections are absent'