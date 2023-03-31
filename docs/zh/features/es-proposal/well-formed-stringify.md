---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [结构良好的 `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify)

## 类型

```ts
interface JSON {
  stringify(
    target: any,
    replacer?:
      | Array<string | number>
      | ((key: string, value: any) => any)
      | null,
    space?: string | number
  ): string | void;
}
```

## 入口点

```
core-js/proposals/well-formed-stringify
```
