# Iterator includes
[Specification](https://tc39.es/proposal-iterator-includes/)\
[Proposal repo](https://github.com/tc39/proposal-iterator-includes)

## Modules
[`esnext.iterator.includes`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.iterator.includes.js)

## Built-ins signatures
```ts
class Iterator {
  includes(searchElement: any, skippedElements?: number): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-includes
core-js(-pure)/full/iterator/includes
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/iterator-includes`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/iterator-includes.d.ts)

## Examples
```js
[1, 2, 3].values().includes(2);     // => true
[1, 2, 3].values().includes(4);     // => false
[NaN].values().includes(NaN);       // => true
[1, 2, 3].values().includes(3, 2);  // => true
[1, 2, 3].values().includes(1, 1);  // => false
```
