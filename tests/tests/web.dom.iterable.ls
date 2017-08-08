{module, test} = QUnit
module 'Web'

test 'Iterable DOM collections' (assert)->
  absent = on;
  for <[NodeList DOMTokenList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[Symbol?toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction Collection::[Symbol?iterator], "#{..}::@@iterator is function"
      assert.isFunction Collection::values, "#{..}::@@values is function"
      assert.isFunction Collection::keys, "#{..}::@@keys is function"
      assert.isFunction Collection::entries, "#{..}::@@entries is function"
      absent = no

  for <[CSSStyleDeclaration CSSValueList ClientRectList DOMRectList
    DOMStringList DataTransferItemList FileList HTMLAllCollection
    HTMLCollection HTMLFormElement HTMLSelectElement
    MimeTypeArray NamedNodeMap PaintRequestList Plugin PluginArray SVGLengthList
    SVGNumberList SVGPathSegList SVGPointList SVGStringList SVGTransformList
    SourceBufferList TextTrackCueList TextTrackList TouchList]>
    Collection = global[..]
    if Collection
      assert.same Collection::[Symbol?toStringTag], .., "#{..}::@@toStringTag is '#{..}'"
      assert.isFunction Collection::[Symbol?iterator], "#{..}::@@iterator is function"
      absent = no

  if NodeList? and document?querySelectorAll and document.querySelectorAll(\div) instanceof NodeList
    assert.isFunction document.querySelectorAll(\div)[Symbol.iterator], 'works with document.querySelectorAll'
  if absent => assert.ok on, 'DOM collections are absent'