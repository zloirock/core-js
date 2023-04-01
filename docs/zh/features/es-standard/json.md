---
category: feature
tag:
  - es-standard
---

# `JSON`

由于 `JSON` 对象只在 IE7- 等很老的引擎中缺失，Core-JS 不提供完整的 `JSON` polyfill，但是会修复现有标准中已经存在的实现，比如[结构良好的 `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)。`JSON` 也在别的模块中被修复——比如 `Symbol` polyfill 为了使 symbol 正常工作而修复了 `JSON.stringify`。

## 模块

- [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.to-string-tag.js)
- [`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js)

## 类型

```ts
interface JSON {
  stringify(
    value: any,
    replacer?:
      | Array<string | number>
      | ((key: string, value: any) => any)
      | null,
    space?: string | number
  ): string | void;
  [Symbol.toStringTag]: "JSON";
}
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/json/stringify
core-js(-pure)/es|stable|actual|full/json/to-string-tag
```

## 示例

[_示例_](https://is.gd/izZqKn):

```js
JSON.stringify({ "𠮷": ["\uDF06\uD834"] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```
