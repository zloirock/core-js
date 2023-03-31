---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#matchAll`](https://github.com/tc39/proposal-string-matchall).

## 类型

```ts
interface String {
  matchAll(regexp: RegExp): IterableIterator<RegExpMatchArray>;
}
```

## 入口点

```
core-js/proposals/string-match-all
```
