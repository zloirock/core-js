# Iterator chunking
[Specification](https://tc39.es/proposal-iterator-chunking/)\
[Proposal repo](https://github.com/tc39/proposal-iterator-chunking)

## Modules 
[`esnext.iterator.chunks`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.chunks.js), [`esnext.iterator.sliding`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.sliding.js)
and [`esnext.iterator.windows`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.windows.js)

## Built-ins signatures
```ts
class Iterator {
  chunks(chunkSize: number): Iterator<any>;
  sliding(windowSize: number): Iterator<any>;
  windows(windowSize: number): Iterator<any>;
}
```

## [Entry points]({docs-version}/docs/usage#entry-points)
```ts
core-js/proposals/iterator-chunking
core-js(-pure)/full/iterator/chunks
core-js(-pure)/full/iterator/sliding
core-js(-pure)/full/iterator/windows
```

## Examples
```js
const digits = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

let chunksOf2 = Array.from(digits().chunks(2));  // => [ [0, 1], [2, 3], [4, 5], [6, 7], [8, 9] ]

let slidingOf2 = Array.from(digits().sliding(2));  // => [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9] ]

let windowsOf2 = Array.from(digits().windows(2));  // => [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9] ]
```
