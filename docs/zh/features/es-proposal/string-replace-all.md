---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String#replaceAll`](https://github.com/tc39/proposal-string-replace-all)

:::warning
你可能需要加载`core-js/es|stable|actual|full/string/replace`以 polyfill `RegExp[Symbol.replace]`。否则当第一个参数为正则表达式且第二个参数为函数时，替换函数的参数可能与规范不一致。
:::

## 类型

```ts
interface String {
  replaceAll(
    searchValue: string | RegExp,
    replacer: string | ((searchValue: string, ...args: any[]) => string)
  ): string;
}
```

## 入口点

```
core-js/proposals/string-replace-all-stage-4
```
