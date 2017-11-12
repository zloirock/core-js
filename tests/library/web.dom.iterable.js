import { GLOBAL } from '../helpers/constants';

var Symbol = core.Symbol;

QUnit.test('Iterable DOM collections', function (assert) {
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
    var Collection = GLOBAL[name];
    if (Collection) {
      assert.same(Collection.prototype[Symbol.toStringTag], name, name + "::@@toStringTag is '" + name + "'");
      assert.isFunction(core.getIteratorMethod(Collection.prototype), name + '::@@iterator is function');
      absent = false;
    }
  }

  if (GLOBAL.NodeList && GLOBAL.document && document.querySelectorAll && document.querySelectorAll('div') instanceof NodeList) {
    assert.isFunction(core.getIteratorMethod(document.querySelectorAll('div')), 'works with document.querySelectorAll');
  }

  if (absent) {
    assert.ok(true, 'DOM collections are absent');
  }
});
