import { GLOBAL } from '../helpers/constants';

import Symbol from 'core-js-pure/full/symbol';
import getIteratorMethod from 'core-js-pure/full/get-iterator-method';

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
    'TouchList',
  ];

  for (const name of collections) {
    const Collection = GLOBAL[name];
    if (Collection) {
      absent = false;
      assert.same(Collection.prototype[Symbol.toStringTag], name, `${ name }::@@toStringTag is '${ name }'`);
      if (Object.prototype.toString.call(Collection.prototype).slice(8, -1) === name) {
        assert.isFunction(getIteratorMethod(Collection.prototype), `${ name }::@@iterator is function`);
      }
    }
  }

  if (GLOBAL.NodeList && GLOBAL.document && document.querySelectorAll && document.querySelectorAll('div') instanceof NodeList) {
    assert.isFunction(getIteratorMethod(document.querySelectorAll('div')), 'works with document.querySelectorAll');
  }

  if (absent) {
    assert.ok(true, 'DOM collections are absent');
  }
});
