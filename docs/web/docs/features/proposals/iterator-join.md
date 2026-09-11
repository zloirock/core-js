# Iterator join
[Specification](https://tc39.es/proposal-iterator-join)\
[Proposal repo](https://github.com/tc39/proposal-iterator-join)

## Modules
[`esnext.iterator.join`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.join.js)

## Built-ins signatures
```ts
class Iterator {
  join(separator?: string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-join
core-js(-pure)/actual|full/iterator/join
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/iterator-join`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/iterator-join.d.ts)

## Examples
```js
[1, 2, 3].values().join();     // => '1,2,3'
[1, 2, 3].values().join('-');  // => '1-2-3'
[1, null, 3].values().join();  // => '1,,3'
```
