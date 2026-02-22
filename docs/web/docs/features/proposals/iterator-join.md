# Iterator join
[Specification](https://bakkot.github.io/proposal-iterator-join/)\
[Proposal repo](https://github.com/bakkot/proposal-iterator-join)

## Modules
[`esnext.iterator.join`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.iterator.join.js)

## Built-ins signatures
```ts
class Iterator {
  join(separator?: string | undefined): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-join
core-js(-pure)/full/iterator/join
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/iterator-join`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/proposals/iterator-join.d.ts)

## Examples
```js
const digits = () => [1, 2, 3].values();
digits().join();  // => '1,2,3'

const words = () => ['Hello', 'core-js'].values();
words().join(' ');  // => 'Hello core-js'
```
