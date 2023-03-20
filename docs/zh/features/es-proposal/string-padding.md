---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`String` 填充](https://github.com/tc39/proposal-string-pad-start-end)

## 类型

```ts
class String {
  padStart(length: number, fillStr?: string = " "): string;
  padEnd(length: number, fillStr?: string = " "): string;
}
```

## 入口点

```
core-js/proposals/string-padding
```
