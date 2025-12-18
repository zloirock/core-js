# `String#replaceAll`
[Specification](https://tc39.es/proposal-string-replaceall/)\
[Proposal repo](https://github.com/tc39/proposal-string-replace-all)

## Built-ins signatures
```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-replace-all
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-replace-all`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/string-replace-all.d.ts)
