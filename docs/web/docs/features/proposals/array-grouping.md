# `Array` grouping
[Specification](https://tc39.es/proposal-array-grouping/)\
[Proposal repo](https://github.com/tc39/proposal-array-grouping)

## Signature
```ts
class Object {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): { [key]: Array<mixed> };
}

class Map {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): Map<key, Array<mixed>>;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```
core-js/proposals/array-grouping-v2
```
