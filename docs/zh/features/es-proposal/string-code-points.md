---
category: feature
tag:
  - es-proposal
---

# [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints)

## 模块

[`esnext.string.code-points`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.code-points.js)

## 类型

```ts
interface String {
  codePoints(): Iterator<{ codePoint: number; position: number }>;
}
```

## 入口点

```
core-js/proposals/string-code-points
core-js(-pure)/full/string/code-points
```

## 示例

[_示例_](https://goo.gl/Jt7SsD):

```js
for (let { codePoint, position } of "qwe".codePoints()) {
  console.log(codePoint); // => 113, 119, 101
  console.log(position); // => 0, 1, 2
}
```
