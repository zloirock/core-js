---
category: feature
tag:
  - es-proposal
---

# [`String.cooked`](https://github.com/tc39/proposal-string-cooked)

## 模块

[`esnext.string.cooked`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.cooked.js)

## 类型

```ts
interface StringConstructor {
  cooked(template: Array<string>, ...substitutions: Array<string>): string;
}
```

## 入口点

```
core-js/proposals/string-cooked
core-js(-pure)/full/string/cooked
```

## 示例

[_示例_](https://is.gd/7QPnss):

```js
function safePath(strings, ...subs) {
  return String.cooked(strings, ...subs.map((sub) => encodeURIComponent(sub)));
}

let id = "spottie?";

safePath`/cats/${id}`; // => /cats/spottie%3F
```
