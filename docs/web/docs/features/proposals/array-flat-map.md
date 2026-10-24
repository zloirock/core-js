# `Array.prototype.{ flat, flatMap }`
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
```plaintext
core-js/proposals/array-flat-map
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-flat-map.d.ts)
