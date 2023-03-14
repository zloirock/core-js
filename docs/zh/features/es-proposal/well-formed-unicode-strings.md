---
category: feature
tag:
  - es-proposal
  - untranslated
---

s# [Well-formed unicode strings](https://github.com/tc39/proposal-is-usv-string)

## Modules

-[`esnext.string.is-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.is-well-formed.js)

- [`esnext.string.to-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.to-well-formed.js)

```ts
class String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}
```

## Entry points

```
core-js/proposals/well-formed-unicode-strings
core-js(-pure)/actual|full/string(/virtual)/is-well-formed
core-js(-pure)/actual|full/string(/virtual)/to-well-formed
```

## Example

[_Example_](https://tinyurl.com/2fulc2ak):

```js
"a💩b".isWellFormed(); // => true
"a\uD83Db".isWellFormed(); // => false
"a💩b".toWellFormed(); // => 'a💩b'
"a\uD83Db".toWellFormed(); // => 'a�b'
```
