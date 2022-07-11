# [`.of` and `.from` methods on collection constructors](https://github.com/tc39/proposal-setmap-offrom)
Modules [`esnext.set.of`](/packages/core-js/modules/esnext.set.of.js), [`esnext.set.from`](/packages/core-js/modules/esnext.set.from.js), [`esnext.map.of`](/packages/core-js/modules/esnext.map.of.js), [`esnext.map.from`](/packages/core-js/modules/esnext.map.from.js), [`esnext.weak-set.of`](/packages/core-js/modules/esnext.weak-set.of.js), [`esnext.weak-set.from`](/packages/core-js/modules/esnext.weak-set.from.js), [`esnext.weak-map.of`](/packages/core-js/modules/esnext.weak-map.of.js), [`esnext.weak-map.from`](/packages/core-js/modules/esnext.weak-map.from.js)
```ts
class Set {
  static of(...args: Array<mixed>): Set;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => any, thisArg?: any): Set;
  addAll(...args: Array<mixed>): this;
  deleteAll(...args: Array<mixed>): boolean;
  every(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  filter(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): Set;
  find(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  join(separator: string = ','): string;
  map(callbackfn: (value: any, key: any, target: any) => any, thisArg?: any): Set;
  reduce(callbackfn: (memo: any, value: any, key: any, target: any) => any, initialValue?: any): any;
  some(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
}

class Map {
  static groupBy(iterable: Iterable<mixed>, callbackfn?: (value: any) => any): Map;
  static of(...args: Array<[key, value]>): Map;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: any, value: any], thisArg?: any): Map;
  static keyBy(iterable: Iterable<mixed>, callbackfn?: (value: any) => any): Map;
  deleteAll(...args: Array<mixed>): boolean;
  every(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  filter(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): Map;
  find(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  findKey(callbackfn: (value: any, key: any, target: any) => boolean), thisArg?: any): any;
  includes(searchElement: any): boolean;
  keyOf(searchElement: any): any;
  mapKeys(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Map;
  mapValues(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Map;
  merge(...iterables: Array<Iterable>): this;
  reduce(callbackfn: (memo: any, value: any, key: any, target: any) => any, initialValue?: any): any;
  some(callbackfn: (value: any, key: any, target: any) => boolean, thisArg?: any): boolean;
  update(key: any, callbackfn: (value: any, key: any, target: any) => any, thunk?: (key: any, target: any) => any): this;
}

class WeakSet {
  static of(...args: Array<mixed>): WeakSet;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => Object, thisArg?: any): WeakSet;
  addAll(...args: Array<mixed>): this;
  deleteAll(...args: Array<mixed>): boolean;
}

class WeakMap {
  static of(...args: Array<[key, value]>): WeakMap;
  static from(iterable: Iterable<mixed>, mapFn?: (value: any, index: number) => [key: Object, value: any], thisArg?: any): WeakMap;
  deleteAll(...args: Array<mixed>): boolean;
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/collection-methods
core-js/proposals/collection-of-from
core-js(-pure)/full/set/add-all
core-js(-pure)/full/set/delete-all
core-js(-pure)/full/set/every
core-js(-pure)/full/set/filter
core-js(-pure)/full/set/find
core-js(-pure)/full/set/from
core-js(-pure)/full/set/join
core-js(-pure)/full/set/map
core-js(-pure)/full/set/of
core-js(-pure)/full/set/reduce
core-js(-pure)/full/set/some
core-js(-pure)/full/map/delete-all
core-js(-pure)/full/map/every
core-js(-pure)/full/map/filter
core-js(-pure)/full/map/find
core-js(-pure)/full/map/find-key
core-js(-pure)/full/map/from
core-js(-pure)/full/map/group-by
core-js(-pure)/full/map/includes
core-js(-pure)/full/map/key-by
core-js(-pure)/full/map/key-of
core-js(-pure)/full/map/map-keys
core-js(-pure)/full/map/map-values
core-js(-pure)/full/map/merge
core-js(-pure)/full/map/of
core-js(-pure)/full/map/reduce
core-js(-pure)/full/map/some
core-js(-pure)/full/map/update
core-js(-pure)/full/weak-set/add-all
core-js(-pure)/full/weak-set/delete-all
core-js(-pure)/full/weak-set/of
core-js(-pure)/full/weak-set/from
core-js(-pure)/full/weak-map/delete-all
core-js(-pure)/full/weak-map/of
core-js(-pure)/full/weak-map/from
```
`.of` / `.from` [*examples*](https://goo.gl/mSC7eU):
```js
Set.of(1, 2, 3, 2, 1); // => Set {1, 2, 3}

Map.from([[1, 2], [3, 4]], ([key, value]) => [key ** 2, value ** 2]); // => Map { 1: 4, 9: 16 }
```
