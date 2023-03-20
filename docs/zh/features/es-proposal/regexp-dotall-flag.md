---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`RegExp` `s` (`dotAll`) flag](https://github.com/tc39/proposal-regexp-dotall-flag)

## 类型

```ts
// patched for support `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```

## 入口点

```
core-js/proposals/regexp-dotall-flag
```
