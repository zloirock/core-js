# Iterator chunking
[Specification](https://tc39.es/proposal-iterator-chunking/)\
[Proposal repo](https://github.com/tc39/proposal-iterator-chunking)

## Modules 
[`esnext.iterator.chunks`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.iterator.chunks.js), [`esnext.iterator.windows`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.iterator.windows.js)

## Built-ins signatures
```ts
class Iterator {
  chunks(chunkSize: number): Iterator<any>;
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): Iterator<any>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-chunking-v2
core-js(-pure)/full/iterator/chunks
core-js(-pure)/full/iterator/windows
```

## Examples
```js
const digits = () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].values();

Array.from(digits().chunks(2));  // => [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]

Array.from(digits().windows(2));  // => [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]

Array.from([0, 1].values().windows(3, 'allow-partial'));  // => [[0, 1]]

Array.from([0, 1].values().windows(3));  // => []
```
