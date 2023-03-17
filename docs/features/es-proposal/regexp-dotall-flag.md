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
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  readonly dotAll: boolean;
  readonly flags: string;
}
```

## Entry points

```
core-js/proposals/regexp-dotall-flag
```
