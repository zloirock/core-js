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
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```

## 入口点

```
core-js/proposals/regexp-named-groups
```
