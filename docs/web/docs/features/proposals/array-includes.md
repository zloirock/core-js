# `Array.prototype.includes`
[Specification](https://tc39.es/proposal-Array.prototype.includes/)\
[Proposal repo](https://github.com/tc39/proposal-Array.prototype.includes)

## Modules
[`es.array.includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.array.includes.js) and [`es.typed-array.includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.typed-array.includes.js).

## Built-ins signatures
```ts
class Array {
  includes(searchElement: any, from?: number): boolean;
}

class %TypedArray% {
  includes(searchElement: any, from?: number): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/array-includes
{ core-js, @core-js/pure }/es|stable|actual|full/array(/prototype)/includes
core-js/es|stable|actual|full/typed-array/includes
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/array-includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/array-includes.d.ts)

## Examples
```js
[1, 2, 3].includes(2);        // => true
[1, 2, 3].includes(4);        // => false
[1, 2, 3].includes(2, 2);     // => false

[NaN].indexOf(NaN);           // => -1
[NaN].includes(NaN);          // => true
Array(1).indexOf(undefined);  // => -1
Array(1).includes(undefined); // => true
```
