# `Object.values` / `Object.entries`
[Specification](https://tc39.es/proposal-object-values-entries/)\
[Proposal repo](https://github.com/tc39/proposal-object-values-entries)

## Built-ins signatures
```ts
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/object-values-entries
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/object-values-entries`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/object-values-entries.d.ts)
