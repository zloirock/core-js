---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)

::: warning
You may need to load `core-js/es|stable|actual|full/string/replace` to polyfill `RegExp[Symbol.replace]`. Otherwise when the first argument is a regular expression and the second argument is a function, the arguments to the replacement function may not match the specification.
:::

## Types

```ts
interface String {
  replaceAll(
    searchValue: string | RegExp,
    replacer: string | ((searchValue: string, ...args: any[]) => string)
  ): string;
}
```

## Entry points

```
core-js/proposals/string-replace-all-stage-4
```
