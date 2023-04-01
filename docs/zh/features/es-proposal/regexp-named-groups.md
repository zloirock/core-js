---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`RegExp` 命名捕获组](https://github.com/tc39/proposal-regexp-named-groups)

## 类型

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

## 入口点

```
core-js/proposals/regexp-named-groups
```
