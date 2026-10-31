# `Array.prototype.{ flat, flatMap }`
[Specification](https://tc39.es/proposal-flatMap/)\
[Proposal repo](https://github.com/tc39/proposal-flatMap)

## Modules
[`es.array.flat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.flat.js), [`es.array.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.flat-map.js), [`es.array.unscopables.flat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.unscopables.flat.js) and [`es.array.unscopables.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.unscopables.flat-map.js).

## Built-ins signatures
```ts
class Array {
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-flat-map
{ core-js, @core-js/pure }/es|stable|actual|full/array(/prototype)/flat
{ core-js, @core-js/pure }/es|stable|actual|full/array(/prototype)/flat-map
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-flat-map.d.ts)

## Examples
```js
[1, [2, 3], [4, 5]].flat();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flat();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flat(3); // => [1, 2, 3, 4, 5]

[{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]
```
