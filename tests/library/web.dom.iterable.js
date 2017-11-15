import { GLOBAL } from '../helpers/constants';

const { Symbol } = core;

QUnit.test('Iterable DOM collections', assert => {
  let absent = true;
  const collections = [
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

  for (const name of collections) {
    const Collection = GLOBAL[name];
    if (Collection) {
      assert.same(Collection.prototype[Symbol.toStringTag], name, `${ name }::@@toStringTag is '${ name }'`);
      assert.isFunction(core.getIteratorMethod(Collection.prototype), `${ name }::@@iterator is function`);
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
