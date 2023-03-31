---
category: feature
tag:
  - es-proposal
---

# [结构良好的 unicode 字符串](https://github.com/tc39/proposal-is-usv-string)

## 模块

-[`esnext.string.is-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.is-well-formed.js)

- [`esnext.string.to-well-formed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.string.to-well-formed.js)

```ts
interface String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}

```

## 入口点
```
core-js/proposals/well-formed-unicode-strings
core-js(-pure)/actual|full/string(/virtual)/is-well-formed
core-js(-pure)/actual|full/string(/virtual)/to-well-formed
```

## 示例

[_示例_](https://tinyurl.com/2fulc2ak):

```js
"a💩b".isWellFormed(); // => true
"a\uD83Db".isWellFormed(); // => false
"a💩b".toWellFormed(); // => 'a💩b'
"a\uD83Db".toWellFormed(); // => 'a�b'
```
