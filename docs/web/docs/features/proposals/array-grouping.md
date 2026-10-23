# `Array` grouping
[Specification](https://tc39.es/proposal-array-grouping/)\
[Proposal repo](https://github.com/tc39/proposal-array-grouping)

## Modules
[`es.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.group-by.js) and [`es.object.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.group-by.js).

## Built-ins signatures
```ts
class Object {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): { [key]: Array<mixed> };
}

class Map {
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): Map<key, Array<mixed>>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-grouping
core-js(-pure)/es|stable|actual|full/map/group-by
core-js(-pure)/es|stable|actual|full/object/group-by
```

## Examples
```js
Object.groupBy([1, 2, 3, 4, 5], it => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }

const map = Map.groupBy([1, 2, 3, 4, 5], it => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-grouping`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-grouping.d.ts)
