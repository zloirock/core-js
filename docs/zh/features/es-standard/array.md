---
category: feature
tag:
  - es-standard
---

# `Array`

## 模块

- [`es.array.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.from.js)
- [`es.array.is-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.is-array.js)
- [`es.array.of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.of.js)
- [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.copy-within.js)
- [`es.array.fill`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.fill.js)
- [`es.array.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find.js)
- [`es.array.find-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-index.js)
- [`es.array.find-last`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-last.js)
- [`es.array.find-last-index`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.find-last-index.js)
- [`es.array.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.iterator.js)
- [`es.array.includes`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.includes.js)
- [`es.array.push`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.push.js)
- [`es.array.slice`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.slice.js)
- [`es.array.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.join.js)
- [`es.array.unshift`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unshift.js)
- [`es.array.index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.index-of.js)
- [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.last-index-of.js)
- [`es.array.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.every.js)
- [`es.array.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.some.js)
- [`es.array.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.for-each.js)
- [`es.array.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.map.js)
- [`es.array.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.filter.js)
- [`es.array.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reduce.js)
- [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reduce-right.js)
- [`es.array.reverse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.reverse.js)
- [`es.array.sort`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.sort.js)
- [`es.array.flat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.flat.js)
- [`es.array.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.flat-map.js)
- [`es.array.unscopables.flat`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unscopables.flat.js)
- [`es.array.unscopables.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.unscopables.flat-map.js)
- [`es.array.at`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.array.at.js)

## 类型

```ts
interface Array<T> {
  at(index: number): T;
  concat(...args: Array<T>): Array<T>; // with adding support of @@isConcatSpreadable and @@species
  copyWithin(target: number, start: number, end?: number): Array<T>;
  entries(): Iterator<[[index: number], T]>;
  every(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): boolean;
  fill(value: T, start?: number, end?: number): Array<T>;
  filter(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): Array<T>; // with adding support of @@species
  find(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): any;
  findIndex(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): number;
  findLast(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): T;
  findLastIndex(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): number;
  flat<A, D extends number = 1>(this: A, depth?: D): Array<T>;
  flatMap(
    mapFn: (value: T, index: number, target: Array<T>) => any,
    thisArg: any
  ): Array<T>;
  forEach(
    callbackfn: (value: T, index: number, target: Array<T>) => void,
    thisArg?: any
  ): void;
  includes(searchElement: T, from?: number): boolean;
  indexOf(searchElement: T, from?: number): number;
  join(separator?: string): string;
  keys(): Iterator<number>;
  lastIndexOf(searchElement: any, from?: number): number;
  map(
    mapFn: (value: T, index: number, target: Array<T>) => any,
    thisArg?: any
  ): Array<T>; // with adding support of @@species
  push(...args: Array<T>): number;
  reduce(
    callbackfn: (memo: any, value: T, index: number, target: Array<T>) => any,
    initialValue?: any
  ): any;
  reduceRight(
    callbackfn: (memo: any, value: T, index: number, target: Array<T>) => any,
    initialValue?: any
  ): any;
  reverse(): Array<T>; // Safari 12.0 bug fix
  slice(start?: number, end?: number): Array<T>; // with adding support of @@species
  splice(start?: number, deleteCount?: number, ...items: Array<T>): Array<T>; // with adding support of @@species
  some(
    callbackfn: (value: T, index: number, target: Array<T>) => boolean,
    thisArg?: any
  ): boolean;
  sort(comparefn?: (a: any, b: any) => number): Array<T>; // with modern behavior like stable sort
  toReversed(): Array<T>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<T>): Array<T>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<T>;
  unshift(...args: Array<T>): number;
  values(): Iterator<T>;
  with(index: number, value: T): Array<T>;
  [Symbol.iterator]: Iterator<T>;
  [Symbol.unscopables]: { [newMethodNames: string]: true };
}
interface ArrayConstructor {
  from<T, U>(
    items: Iterable<T> | ArrayLike<T>,
    mapFn?: (value: T, index: number) => U,
    thisArg?: any
  ): Array<U>;
  isArray(value: any): boolean;
  of<T>(...args: Array<T>): Array<T>;
}

class Arguments<T> {
  [Symbol.iterator](): Iterator<T>; // available only in core-js methods
}
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/array
core-js(-pure)/es|stable|actual|full/array/from
core-js(-pure)/es|stable|actual|full/array/of
core-js(-pure)/es|stable|actual|full/array/is-array
core-js(-pure)/es|stable|actual|full/array/at
core-js(-pure)/es|stable|actual|full/array/concat
core-js(-pure)/es|stable|actual|full/array/entries
core-js(-pure)/es|stable|actual|full/array/every
core-js(-pure)/es|stable|actual|full/array/copy-within
core-js(-pure)/es|stable|actual|full/array/fill
core-js(-pure)/es|stable|actual|full/array/filter
core-js(-pure)/es|stable|actual|full/array/find
core-js(-pure)/es|stable|actual|full/array/find-index
core-js(-pure)/es|stable|actual|full/array/find-last
core-js(-pure)/es|stable|actual|full/array/find-last-index
core-js(-pure)/es|stable|actual|full/array/flat
core-js(-pure)/es|stable|actual|full/array/flat-map
core-js(-pure)/es|stable|actual|full/array/for-each
core-js(-pure)/es|stable|actual|full/array/includes
core-js(-pure)/es|stable|actual|full/array/index-of
core-js(-pure)/es|stable|actual|full/array/iterator
core-js(-pure)/es|stable|actual|full/array/join
core-js(-pure)/es|stable|actual|full/array/keys
core-js(-pure)/es|stable|actual|full/array/last-index-of
core-js(-pure)/es|stable|actual|full/array/map
core-js(-pure)/es|stable|actual|full/array/push
core-js(-pure)/es|stable|actual|full/array/reduce
core-js(-pure)/es|stable|actual|full/array/reduce-right
core-js(-pure)/es|stable|actual|full/array/reverse
core-js(-pure)/es|stable|actual|full/array/slice
core-js(-pure)/es|stable|actual|full/array/splice
core-js(-pure)/es|stable|actual|full/array/some
core-js(-pure)/es|stable|actual|full/array/sort
core-js(-pure)/es|stable|actual|full/array/unshift
core-js(-pure)/es|stable|actual|full/array/values
core-js(-pure)/es|stable|actual|full/array/virtual/at
core-js(-pure)/es|stable|actual|full/array/virtual/concat
core-js(-pure)/es|stable|actual|full/array/virtual/copy-within
core-js(-pure)/es|stable|actual|full/array/virtual/entries
core-js(-pure)/es|stable|actual|full/array/virtual/every
core-js(-pure)/es|stable|actual|full/array/virtual/fill
core-js(-pure)/es|stable|actual|full/array/virtual/filter
core-js(-pure)/es|stable|actual|full/array/virtual/find
core-js(-pure)/es|stable|actual|full/array/virtual/find-index
core-js(-pure)/es|stable|actual|full/array/virtual/find-last
core-js(-pure)/es|stable|actual|full/array/virtual/find-last-index
core-js(-pure)/es|stable|actual|full/array/virtual/flat
core-js(-pure)/es|stable|actual|full/array/virtual/flat-map
core-js(-pure)/es|stable|actual|full/array/virtual/for-each
core-js(-pure)/es|stable|actual|full/array/virtual/includes
core-js(-pure)/es|stable|actual|full/array/virtual/index-of
core-js(-pure)/es|stable|actual|full/array/virtual/iterator
core-js(-pure)/es|stable|actual|full/array/virtual/join
core-js(-pure)/es|stable|actual|full/array/virtual/keys
core-js(-pure)/es|stable|actual|full/array/virtual/last-index-of
core-js(-pure)/es|stable|actual|full/array/virtual/map
core-js(-pure)/es|stable|actual|full/array/virtual/push
core-js(-pure)/es|stable|actual|full/array/virtual/reduce
core-js(-pure)/es|stable|actual|full/array/virtual/reduce-right
core-js(-pure)/es|stable|actual|full/array/virtual/reverse
core-js(-pure)/es|stable|actual|full/array/virtual/slice
core-js(-pure)/es|stable|actual|full/array/virtual/some
core-js(-pure)/es|stable|actual|full/array/virtual/sort
core-js(-pure)/es|stable|actual|full/array/virtual/splice
core-js(-pure)/es|stable|actual|full/array/virtual/unshift
core-js(-pure)/es|stable|actual|full/array/virtual/values
```

## 示例

[_示例_](https://tinyurl.com/2br28bgj):

```js
Array.from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
Array.from({ 0: 1, 1: 2, 2: 3, length: 3 }); // => [1, 2, 3]
Array.from("123", Number); // => [1, 2, 3]
Array.from("123", (it) => it * it); // => [1, 4, 9]

Array.of(1); // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

let array = ["a", "b", "c"];

for (let value of array) console.log(value); // => 'a', 'b', 'c'
for (let value of array.values()) console.log(value); // => 'a', 'b', 'c'
for (let key of array.keys()) console.log(key); // => 0, 1, 2
for (let [key, value] of array.entries()) {
  console.log(key); // => 0, 1, 2
  console.log(value); // => 'a', 'b', 'c'
}

function isOdd(value) {
  return value % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd); // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[1, 2, 3, 4].findLast(isOdd); // => 3
[1, 2, 3, 4].findLastIndex(isOdd); // => 2

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]

[1, 2, 3].includes(2); // => true
[1, 2, 3].includes(4); // => false
[1, 2, 3].includes(2, 2); // => false

[NaN].indexOf(NaN); // => -1
[NaN].includes(NaN); // => true
Array(1).indexOf(undefined); // => -1
Array(1).includes(undefined); // => true

[1, [2, 3], [4, 5]].flat(); // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flat(); // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flat(3); // => [1, 2, 3, 4, 5]

[
  { a: 1, b: 2 },
  { a: 3, b: 4 },
  { a: 5, b: 6 },
].flatMap((it) => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]

[1, 2, 3].at(1); // => 2
[1, 2, 3].at(-1); // => 3
```
