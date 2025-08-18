# `RegExp` `s` (`dotAll`) flag
[Specification](https://tc39.es/proposal-regexp-dotall-flag/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-dotall-flag)

## Signature
```ts
// patched for support `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/regexp-dotall-flag
```
