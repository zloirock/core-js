---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`RegExp` `s` (`dotAll`) 标记](https://github.com/tc39/proposal-regexp-dotall-flag)

## 类型

```ts
// patched for support `RegExp` dotAll (`s`) flag:
interface RegExp {
  new (pattern: RegExp | string, flags?: string): RegExp;
  exec(): RegExpExecResult | null;
  readonly dotAll: boolean;
  readonly flags: string;
}

interface RegExpExecResult extends Array<string> {
  index: number;
  input: string;
}
```

## 入口点

```
core-js/proposals/regexp-dotall-flag
```
