# Await dictionary
[Specification](https://tc39.es/proposal-await-dictionary/)\
[Proposal repo](https://github.com/tc39/proposal-await-dictionary)

## Modules
[`esnext.promise.all-keyed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.promise.all-keyed.js)

## Built-ins signatures
```ts
class Promise {
  allKeyed<T extends Record<string, unknown>>(
    obj: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/promise-all-keyed
core-js(-pure)/full/promise/all-keyed
```

## Examples
```js
await Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve(2),
  c: 3,
}); // => { a: 1, b: 2, c: 3 }
```
