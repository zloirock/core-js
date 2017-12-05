import { GLOBAL } from '../helpers/constants';

const Symbol = GLOBAL.Symbol || {};

QUnit.test('Iterable DOM collections', assert => {
  let absent = true;
  let collections = [
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
    'TouchList',
  ];

  for (const name of collections) {
    const Collection = GLOBAL[name];
    if (Collection) {
      assert.same(Collection.prototype[Symbol.toStringTag], name, `${ name }::@@toStringTag is '${ name }'`);
      assert.isFunction(Collection.prototype[Symbol.iterator], `${ name }::@@iterator is function`);
      absent = false;
    }
  }

  if (GLOBAL.NodeList && GLOBAL.document && document.querySelectorAll && document.querySelectorAll('div') instanceof NodeList) {
    assert.isFunction(document.querySelectorAll('div')[Symbol.iterator], 'works with document.querySelectorAll');
  }

  collections = [
    'NodeList',
    'DOMTokenList',
  ];

  for (const name of collections) {
    const Collection = GLOBAL[name];
    if (Collection) {
      assert.isFunction(Collection.prototype.values, `${ name }::values is function`);
      assert.same(Collection.prototype.values, Array.prototype.values, `${ name }::values is equal of Array::values`);
      assert.isFunction(Collection.prototype.keys, `${ name }::keys is function`);
      assert.same(Collection.prototype.keys, Array.prototype.keys, `${ name }::keys is equal of Array::keys`);
      assert.isFunction(Collection.prototype.entries, `${ name }::entries is function`);
      assert.same(Collection.prototype.entries, Array.prototype.entries, `${ name }::entries is equal of Array::entries`);
    }
  }

  if (absent) {
    assert.ok(true, 'DOM collections are absent');
  }
});
