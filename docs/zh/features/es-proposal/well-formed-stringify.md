---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [结构良好的 `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)

## 类型

```ts
namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
}
```

## 入口点

```
core-js/proposals/well-formed-stringify
```
