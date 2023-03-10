---
category: feature
tag:
  - es-proposal
  - untranslated
---

# [`String#at`](https://github.com/mathiasbynens/String.prototype.at)

::: warning
**This proposal has been withdrawn and will be removed from the next major `core-js` version.**
:::

## Module

[`esnext.string.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.at.js)

## Types

```ts
class String {
  at(index: number): string;
}
```

## Entry points

```
core-js/proposals/string-at
core-js(-pure)/full/string/at
core-js(-pure)/full/string/virtual/at
```

## Example

[_Example_](https://goo.gl/XluXI8):

```js
"a𠮷b".at(1); // => '𠮷'
"a𠮷b".at(1).length; // => 2
```
