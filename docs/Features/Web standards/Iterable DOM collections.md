# Iterable DOM collections
Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That means they should have `forEach`, `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them. Modules [`web.dom-collections.iterator`](/packages/core-js/modules/web.dom-collections.iterator.js) and [`web.dom-collections.for-each`](/packages/core-js/modules/web.dom-collections.for-each.js).
```js
class [
  CSSRuleList,
  CSSStyleDeclaration,
  CSSValueList,
  ClientRectList,
  DOMRectList,
  DOMStringList,
  DataTransferItemList,
  FileList,
  HTMLAllCollection,
  HTMLCollection,
  HTMLFormElement,
  HTMLSelectElement,
  MediaList,
  MimeTypeArray,
  NamedNodeMap,
  PaintRequestList,
  Plugin,
  PluginArray,
  SVGLengthList,
  SVGNumberList,
  SVGPathSegList,
  SVGPointList,
  SVGStringList,
  SVGTransformList,
  SourceBufferList,
  StyleSheetList,
  TextTrackCueList,
  TextTrackList,
  TouchList,
] {
  @@iterator(): Iterator<value>;
}

class [DOMTokenList, NodeList] {
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js(-pure)/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/for-each
```
[*Examples*](https://goo.gl/lfXVFl):
```js
for (let { id } of document.querySelectorAll('*')) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll('*').entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll('*').forEach(it => console.log(it.id));
```