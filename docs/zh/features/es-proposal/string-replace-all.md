---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)

## 类型

```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```

## 入口点

```
core-js/proposals/string-replace-all-stage-4
```
