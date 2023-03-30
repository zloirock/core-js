---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)

## Types

```ts
interface String {
  replaceAll(
    searchValue: string | RegExp,
    replaceString:
      | string
      | ((searchValue: string, index: number, thisStr: string) => string)
  ): string;
}
```

## Entry points

```
core-js/proposals/string-replace-all-stage-4
```
