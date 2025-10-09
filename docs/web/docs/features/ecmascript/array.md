# ECMAScript: Array

## Modules 
[`es.array.from`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.from.js), [`es.array.from-async`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.from-async.js), [`es.array.of`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.of.js), [`es.array.copy-within`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.copy-within.js), [`es.array.fill`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.fill.js), [`es.array.find`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find.js), [`es.array.find-index`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find-index.js), [`es.array.find-last`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find-last.js), [`es.array.find-last-index`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.find-last-index.js), [`es.array.iterator`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.iterator.js), [`es.array.includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.includes.js), [`es.array.push`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.push.js), [`es.array.slice`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.slice.js), [`es.array.join`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.join.js), [`es.array.unshift`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.unshift.js), [`es.array.index-of`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.index-of.js), [`es.array.last-index-of`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.last-index-of.js), [`es.array.map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.map.js), [`es.array.filter`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.filter.js), [`es.array.reduce`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.reduce.js), [`es.array.reduce-right`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.reduce-right.js), [`es.array.reverse`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.reverse.js), [`es.array.sort`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.sort.js), [`es.array.flat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.flat.js), [`es.array.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.flat-map.js), [`es.array.unscopables.flat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.unscopables.flat.js), [`es.array.unscopables.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.unscopables.flat-map.js), [`es.array.at`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.at.js), [`es.array.to-reversed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.to-reversed.js), [`es.array.to-sorted`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.to-sorted.js), [`es.array.to-spliced`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.to-spliced.js), [`es.array.with`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.with.js).

## Built-ins signatures
```ts
class Array {
  at(index: int): any;
  concat(...args: Array<mixed>): Array<mixed>; // with adding support of @@isConcatSpreadable and @@species
  copyWithin(target: number, start: number, end?: number): this;
  entries(): Iterator<[index, value]>;
  fill(value: any, start?: number, end?: number): this;
  filter(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): Array<mixed>; // with adding support of @@species
  find(callbackfn: (value: any, index: number, target: any) => boolean), thisArg?: any): any;
  findIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): uint;
  findLast(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): any;
  findLastIndex(callbackfn: (value: any, index: number, target: any) => boolean, thisArg?: any): uint;
  flat(depthArg?: number = 1): Array<mixed>;
  flatMap(mapFn: (value: any, index: number, target: any) => any, thisArg: any): Array<mixed>;
  includes(searchElement: any, from?: number): boolean;
  indexOf(searchElement: any, from?: number): number;
  join(separator: string = ','): string;
  keys(): Iterator<index>;
  lastIndexOf(searchElement: any, from?: number): number;
  map(mapFn: (value: any, index: number, target: any) => any, thisArg?: any): Array<mixed>; // with adding support of @@species
  push(...args: Array<mixed>): uint;
  reduce(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reduceRight(callbackfn: (memo: any, value: any, index: number, target: any) => any, initialValue?: any): any;
  reverse(): this; // Safari 12.0 bug fix
  slice(start?: number, end?: number): Array<mixed>; // with adding support of @@species
  splice(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>; // with adding support of @@species
  sort(comparefn?: (a: any, b: any) => number): this; // with modern behavior like stable sort
  toReversed(): Array<mixed>;
  toSpliced(start?: number, deleteCount?: number, ...items: Array<mixed>): Array<mixed>;
  toSorted(comparefn?: (a: any, b: any) => number): Array<mixed>;
  unshift(...args: Array<mixed>): uint;
  values(): Iterator<value>;
  with(index: includes, value: any): Array<mixed>;
  @@iterator(): Iterator<value>;
  @@unscopables: { [newMethodNames: string]: true };
  static from(items: Iterable | ArrayLike, mapFn?: (value: any, index: number) => any, thisArg?: any): Array<mixed>;
  static fromAsync(asyncItems: AsyncIterable | Iterable | ArrayLike, mapfn?: (value: any, index: number) => any, thisArg?: any): Array;
  static of(...args: Array<mixed>): Array<mixed>;
}

class Arguments {
  @@iterator(): Iterator<value>; // available only in core-js methods
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/es|stable|actual|full/array
core-js(-pure)/es|stable|actual|full/array/from
core-js(-pure)/es|stable|actual|full/array/from-async
core-js(-pure)/es|stable|actual|full/array/of
core-js(-pure)/es|stable|actual|full/array(/prototype)/at
core-js(-pure)/es|stable|actual|full/array(/prototype)/concat
core-js(-pure)/es|stable|actual|full/array(/prototype)/copy-within
core-js(-pure)/es|stable|actual|full/array(/prototype)/entries
core-js(-pure)/es|stable|actual|full/array(/prototype)/fill
core-js(-pure)/es|stable|actual|full/array(/prototype)/filter
core-js(-pure)/es|stable|actual|full/array(/prototype)/find
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-index
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-last
core-js(-pure)/es|stable|actual|full/array(/prototype)/find-last-index
core-js(-pure)/es|stable|actual|full/array(/prototype)/flat
core-js(-pure)/es|stable|actual|full/array(/prototype)/flat-map
core-js(-pure)/es|stable|actual|full/array(/prototype)/includes
core-js(-pure)/es|stable|actual|full/array(/prototype)/index-of
core-js(-pure)/es|stable|actual|full/array(/prototype)/iterator
core-js(-pure)/es|stable|actual|full/array(/prototype)/join
core-js(-pure)/es|stable|actual|full/array(/prototype)/keys
core-js(-pure)/es|stable|actual|full/array(/prototype)/last-index-of
core-js(-pure)/es|stable|actual|full/array(/prototype)/map
core-js(-pure)/es|stable|actual|full/array(/prototype)/push
core-js(-pure)/es|stable|actual|full/array(/prototype)/reduce
core-js(-pure)/es|stable|actual|full/array(/prototype)/reduce-right
core-js(-pure)/es|stable|actual|full/array(/prototype)/reverse
core-js(-pure)/es|stable|actual|full/array(/prototype)/slice
core-js(-pure)/es|stable|actual|full/array(/prototype)/sort
core-js(-pure)/es|stable|actual|full/array(/prototype)/splice
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-reversed
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-sorted
core-js(-pure)/es|stable|actual|full/array(/prototype)/to-spliced
core-js(-pure)/es|stable|actual|full/array(/prototype)/unshift
core-js(-pure)/es|stable|actual|full/array(/prototype)/values
core-js(-pure)/es|stable|actual|full/array(/prototype)/with
```

## Examples
```js
Array.from(new Set([1, 2, 3, 2, 1]));        // => [1, 2, 3]
Array.from({ 0: 1, 1: 2, 2: 3, length: 3 }); // => [1, 2, 3]
Array.from('123', Number);                   // => [1, 2, 3]
Array.from('123', it => it ** 2);            // => [1, 4, 9]

Array.of(1);       // => [1]
Array.of(1, 2, 3); // => [1, 2, 3]

let array = ['a', 'b', 'c'];

for (let value of array) console.log(value);          // => 'a', 'b', 'c'
for (let value of array.values()) console.log(value); // => 'a', 'b', 'c'
for (let key of array.keys()) console.log(key);       // => 0, 1, 2
for (let [key, value] of array.entries()) {
  console.log(key);                                   // => 0, 1, 2
  console.log(value);                                 // => 'a', 'b', 'c'
}

function isOdd(value) {
  return value % 2;
}
[4, 8, 15, 16, 23, 42].find(isOdd);      // => 15
[4, 8, 15, 16, 23, 42].findIndex(isOdd); // => 2
[1, 2, 3, 4].findLast(isOdd);            // => 3
[1, 2, 3, 4].findLastIndex(isOdd);       // => 2

Array(5).fill(42); // => [42, 42, 42, 42, 42]

[1, 2, 3, 4, 5].copyWithin(0, 3); // => [4, 5, 3, 4, 5]

[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true

[1, [2, 3], [4, 5]].flat();    // => [1, 2, 3, 4, 5]
[1, [2, [3, [4]]], 5].flat();  // => [1, 2, [3, [4]], 5]
[1, [2, [3, [4]]], 5].flat(3); // => [1, 2, 3, 4, 5]

[{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }].flatMap(it => [it.a, it.b]); // => [1, 2, 3, 4, 5, 6]

[1, 2, 3].at(1);  // => 2
[1, 2, 3].at(-1); // => 3

const sequence = [1, 2, 3];
sequence.toReversed(); // => [3, 2, 1]
sequence; // => [1, 2, 3]

const initialArray = [1, 2, 3, 4];
initialArray.toSpliced(1, 2, 5, 6, 7); // => [1, 5, 6, 7, 4]
initialArray; // => [1, 2, 3, 4]

const outOfOrder = [3, 1, 2];
outOfOrder.toSorted(); // => [1, 2, 3]
outOfOrder; // => [3, 1, 2]

const correctionNeeded = [1, 1, 3];
correctionNeeded.with(1, 2); // => [1, 2, 3]
correctionNeeded; // => [1, 1, 3]
```

## `Array.fromAsync` example
```js
await Array.fromAsync(
  (async function * () { yield * [1, 2, 3]; })(), 
  i => i ** 2
); // => [1, 4, 9]
```
