---
category: feature
tag:
  - web-standard
---

# 可迭代的 DOM 集合

一些 DOM 集合包含[可迭代的接口](https://heycam.github.io/webidl/#idl-iterable)或者[继承自 `Array`](https://heycam.github.io/webidl/#LegacyArrayClass)。这意味着它们有用于迭代的 `forEach`、`keys`、`values`、`entries` 和 `@@iterator` 方法。

## 模块

- [`web.dom-collections.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.iterator.js)
- [`web.dom-collections.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.dom-collections.for-each.js)

## 类型

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
  [Symbol.iterator](): Iterator<value>;
}

class [DOMTokenList, NodeList] {
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  [Symbol.iterator](): Iterator<value>;
}
```

## 入口点

```
core-js(-pure)/stable|actual|full/dom-collections/iterator
core-js/stable|actual|full/dom-collections/for-each
```

## 示例

[_示例_](https://goo.gl/lfXVFl):

```js
for (let { id } of document.querySelectorAll("*")) {
  if (id) console.log(id);
}

for (let [index, { id }] of document.querySelectorAll("*").entries()) {
  if (id) console.log(index, id);
}

document.querySelectorAll("*").forEach((it) => console.log(it.id));
```
