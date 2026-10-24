# Asynchronous iteration
[Specification](https://tc39.es/proposal-async-iteration/)\
[Proposal repo](https://github.com/tc39/proposal-async-iteration)

## Modules
[`es.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.async-iterator.js).

## Built-ins signatures
```ts
class Symbol {
  static asyncIterator: @@asyncIterator;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/async-iteration
{ core-js, @core-js/pure }/es|stable|actual|full/symbol/async-iterator
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/async-iteration`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/async-iteration.d.ts)

## Examples
```js
const iterable = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      next: async () => ({ done: i >= 2, value: i++ }),
    };
  },
};

for await (const value of iterable) console.log(value); // -> 0, 1
```
