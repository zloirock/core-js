# `Object.values` / `Object.entries`
[Specification](https://tc39.es/proposal-object-values-entries/)\
[Proposal repo](https://github.com/tc39/proposal-object-values-entries)

## Signature
```ts
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/object-values-entries
```
