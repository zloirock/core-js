---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`RegExp` named capture groups](https://github.com/tc39/proposal-regexp-named-groups)

## Types

```ts
// patched for support `RegExp` named capture groups:
interface RegExp {
  new (pattern: RegExp | string, flags?: string): RegExp;
  exec(): RegExpExecResult | null;
  [Symbol.replace](string: string, replaceValue: Function | string): string;
}

interface RegExpExecResult extends Array<string> {
  groups?: {
    [key: string]: string;
  };
  index: number;
  input: string;
}
```

## Entry points

```
core-js/proposals/regexp-named-groups
```
