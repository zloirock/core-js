# Iterable DOM collections
Some DOM collections should have [iterable interface](https://webidl.spec.whatwg.org/#idl-iterable). `core-js` adds `@@iterator` to all of them and `forEach`, `keys`, `values` and `entries` methods to `DOMTokenList` and `NodeList`.

## Modules
[`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-collections.iterator.js), [`web.dom-collections.entries`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-collections.entries.js), [`web.dom-collections.keys`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-collections.keys.js), [`web.dom-collections.values`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-collections.values.js) and [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.dom-collections.for-each.js).

## Built-ins signatures
```ts
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
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg?: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<value>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
{ core-js, @core-js/pure }/stable|actual|full/dom-collections
{ core-js, @core-js/pure }/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/entries
core-js/stable|actual|full/dom-collections/keys
core-js/stable|actual|full/dom-collections/values
core-js/stable|actual|full/dom-collections/for-each
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/web/iterable-dom-collections`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/web/iterable-dom-collections.d.ts)

## Examples
```js
for (let { id } of document.querySelectorAll('*')) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll('*').entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll('*').forEach(it => console.log(it.id));
```
