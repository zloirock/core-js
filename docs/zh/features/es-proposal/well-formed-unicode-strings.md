---
category: feature
tag:
  - es-proposal
---

# [结构良好的 unicode 字符串](https://github.com/tc39/proposal-is-usv-string)

## 类型
```ts
interface String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}
```

## 入口点

```
core-js/proposals/well-formed-unicode-strings
```
