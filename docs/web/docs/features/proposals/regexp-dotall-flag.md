# `RegExp` `s` (`dotAll`) flag
[Specification](https://tc39.es/proposal-regexp-dotall-flag/)\
[Proposal repo](https://github.com/tc39/proposal-regexp-dotall-flag)

## Built-ins signatures
```ts
// patched for support `RegExp` dotAll (`s`) flag:
class RegExp {
  constructor(pattern: RegExp | string, flags?: string): RegExp;
  exec(): Array<string | undefined> | null;
  readonly attribute dotAll: boolean;
  readonly attribute flags: string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/regexp-dotall-flag
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/regexp-dotall-flag`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/regexp-dotall-flag.d.ts)
