var test = QUnit.test;
var Symbol = global.Symbol || {};

test('Iterable DOM collections', function (assert) {
  var absent = true;
  var collections = [
    'CSSRuleList',
    'CSSStyleDeclaration',
    'CSSValueList',
    'ClientRectList',
    'DOMRectList',
    'DOMStringList',
    'DOMTokenList',
    'DataTransferItemList',
    'FileList',
    'HTMLAllCollection',
    'HTMLCollection',
    'HTMLFormElement',
    'HTMLSelectElement',
    'MediaList',
    'MimeTypeArray',
    'NamedNodeMap',
    'NodeList',
    'PaintRequestList',
    'Plugin',
    'PluginArray',
    'SVGLengthList',
    'SVGNumberList',
    'SVGPathSegList',
    'SVGPointList',
    'SVGStringList',
    'SVGTransformList',
    'SourceBufferList',
    'StyleSheetList',
    'TextTrackCueList',
    'TextTrackList',
    'TouchList'
  ];

  for (var i = 0, length = collections.length; i < length; ++i) {
    var name = collections[i];
    var Collection = global[name];
    if (Collection) {
      assert.same(Collection.prototype[Symbol.toStringTag], name, name + "::@@toStringTag is '" + name + "'");
      assert.isFunction(Collection.prototype[Symbol.iterator], name + '::@@iterator is function');
      absent = false;
    }
  }

  if (global.NodeList && global.document && document.querySelectorAll && document.querySelectorAll('div') instanceof NodeList) {
    assert.isFunction(document.querySelectorAll('div')[Symbol.iterator], 'works with document.querySelectorAll');
  }

  collections = [
    'NodeList',
    'DOMTokenList'
  ];

  for (var i = 0, length = collections.length; i < length; ++i) {
    var name = collections[i];
    var Collection = global[name];
    if (Collection) {
      assert.isFunction(Collection.prototype.values, name + '::@@values is function');
      assert.isFunction(Collection.prototype.keys, name + '::@@keys is function');
      assert.isFunction(Collection.prototype.entries, name + '::@@entries is function');
    }
  }

  if (absent) {
    assert.ok(true, 'DOM collections are absent');
  }
});
