# `Object.values` / `Object.entries`
[Specification](https://github.com/tc39/proposal-object-values-entries)

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
