# `Array.prototype.flat` / `Array.prototype.flatMap`
[Specification](https://tc39.es/proposal-flatMap/)\
[Proposal repo](https://github.com/tc39/proposal-flatMap)

## Built-ins signatures
```ts
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/array-flat-map
```
