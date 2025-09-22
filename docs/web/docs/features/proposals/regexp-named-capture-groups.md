# `RegExp` named capture groups
[Specification](https://tc39.es/proposal-regexp-named-groups/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-named-groups)

## Built-ins signatures
```ts
// patched for support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/regexp-named-groups
```
