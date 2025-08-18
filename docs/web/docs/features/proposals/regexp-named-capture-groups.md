# `RegExp` named capture groups
[Specification](https://tc39.es/proposal-regexp-named-groups/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-named-groups)

## Signature
```ts
// patched for support `RegExp` named capture groups:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  @@replace(string: string, replaceValue: Function | string): string;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/regexp-named-groups
```
