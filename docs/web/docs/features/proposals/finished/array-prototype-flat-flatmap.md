# `Array.prototype.flat` / `Array.prototype.flatMap`
[Specification](https://github.com/tc39/proposal-flatMap)

```ts
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/array-flat-map
```
