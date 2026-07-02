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
```plaintext
core-js/proposals/regexp-named-groups
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/regexp-named-groups`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/regexp-named-groups.d.ts)
