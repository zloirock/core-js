---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)

## Types

```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```

## Entry points

```
core-js/proposals/string-replace-all-stage-4
```
