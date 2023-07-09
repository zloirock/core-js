---
category: feature
tag:
  - es-proposal
---

# [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints)

## Module

[`esnext.string.code-points`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.code-points.js)

## Types

```ts
interface String {
  codePoints(): Iterator<{ codePoint: number; position: number }>;
}
```

## Entry points

```
core-js/proposals/string-code-points
core-js(-pure)/full/string/code-points
```

## Example

[_Example_](https://goo.gl/Jt7SsD):

```js
for (let { codePoint, position } of "qwe".codePoints()) {
  console.log(codePoint); // => 113, 119, 101
  console.log(position); // => 0, 1, 2
}
```
