---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`RegExp` `s` (`dotAll`) flag](https://github.com/tc39/proposal-regexp-dotall-flag)

## Types

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

## Entry points

```
core-js/proposals/regexp-dotall-flag
```
