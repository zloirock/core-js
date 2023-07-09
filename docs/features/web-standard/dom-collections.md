---
category: feature
tag:
  - web-standard
---

# Iterable DOM collections

Some DOM collections should have [iterable interface](https://heycam.github.io/webidl/#idl-iterable) or should be [inherited from `Array`](https://heycam.github.io/webidl/#LegacyArrayClass). That means they should have `forEach`, `keys`, `values`, `entries` and `@@iterator` methods for iteration. So add them.

## Modules

- [`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.iterator.js)
- [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.for-each.js)

## Types

```ts
interface CSSRuleList {
  [Symbol.iterator](): Iterator<CSSRule>;
}
interface CSSStyleDeclaration {
  [Symbol.iterator](): Iterator<string>;
}
interface CSSValueList {
  [Symbol.iterator](): Iterator<CSSValue>;
}
interface ClientRectList {
  [Symbol.iterator](): Iterator<ClientRect>;
}
interface DOMRectList {
  [Symbol.iterator](): Iterator<DOMRect>;
}
interface DOMStringList {
  [Symbol.iterator](): Iterator<string>;
}
interface DataTransferItemList {
  [Symbol.iterator](): Iterator<DataTransferItem>;
}
interface FileList {
  [Symbol.iterator](): Iterator<File>;
}
interface HTMLAllCollection {
  [Symbol.iterator](): Iterator<HTMLAllCollection>;
}
interface HTMLCollection {
  [Symbol.iterator](): Iterator<HTMLCollection>;
}
interface HTMLFormElement {
  [Symbol.iterator](): Iterator<HTMLFormElement>;
}
interface HTMLSelectElement {
  [Symbol.iterator](): Iterator<HTMLSelectElement>;
}
interface MediaList {
  [Symbol.iterator](): Iterator<string>;
}
interface MimeTypeArray {
  [Symbol.iterator](): Iterator<MimeTypeArray>;
}
interface NamedNodeMap {
  [Symbol.iterator](): Iterator<NamedNodeMap>;
}
interface PaintRequestList {
  [Symbol.iterator](): Iterator<PaintRequest>;
}
interface Plugin {
  [Symbol.iterator](): Iterator<MimeType>;
}
interface PluginArray {
  [Symbol.iterator](): Iterator<Plugin>;
}
interface SVGLengthList {
  [Symbol.iterator](): Iterator<SVGLength>;
}
interface SVGNumberList {
  [Symbol.iterator](): Iterator<SVGNumber>;
}
interface SVGPathSegList {
  [Symbol.iterator](): Iterator<SVGPathSeg>;
}
interface SVGPointList {
  [Symbol.iterator](): Iterator<SVGPoint>;
}
interface SVGStringList {
  [Symbol.iterator](): Iterator<string>;
}
interface SVGTransformList {
  [Symbol.iterator](): Iterator<SVGTransform>;
}
interface SourceBufferList {
  [Symbol.iterator](): Iterator<SourceBuffer>;
}
interface StyleSheetList {
  [Symbol.iterator](): Iterator<StyleSheet>;
}
interface TextTrackCueList {
  [Symbol.iterator](): Iterator<TextTrackCue>;
}
interface TextTrackList {
  [Symbol.iterator](): Iterator<TextTrack>;
}
interface TouchList {
  [Symbol.iterator](): Iterator<Touch>;
}

interface DOMTokenList {
  forEach(
    callbackfn: (value: any, index: number, target: any) => void,
    thisArg: any
  ): void;
  entries(): Iterator<[number, string]>;
  keys(): Iterator<number>;
  values(): Iterator<string>;
  [Symbol.iterator](): Iterator<string>;
}
interface NodeList {
  forEach(
    callbackfn: (value: Node, index: number, target: NodeList) => void,
    thisArg: any
  ): void;
  entries(): Iterator<[number, Node]>;
  keys(): Iterator<number>;
  values(): Iterator<Node>;
  [Symbol.iterator](): Iterator<Node>;
}
```

## Entry points

```
core-js(-pure)/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/for-each
```

## Example

[_Example_](https://goo.gl/lfXVFl):

```js
for (let { id } of document.querySelectorAll("*")) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll("*").entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll("*").forEach((it) => console.log(it.id));
```
