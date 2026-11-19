# Await dictionary
[Specification](https://tc39.es/proposal-await-dictionary/)\
[Proposal repo](https://github.com/tc39/proposal-await-dictionary)

## Modules
[`esnext.promise.all-keyed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.promise.all-keyed.js), [`esnext.promise.all-settled-keyed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.promise.all-settled-keyed.js).

## Built-ins signatures
```ts
class Promise {
  static allKeyed(obj: Record<string | symbol, any>): Promise<Record<string | symbol, any>>;
  static allSettledKeyed(obj: Record<string | symbol, any>): Promise<Record<string | symbol, { status: 'fulfilled', value: any } | { status: 'rejected', reason: any }>>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/await-dictionary
{ core-js, @core-js/pure }/actual|full/promise/all-keyed
{ core-js, @core-js/pure }/actual|full/promise/all-settled-keyed
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/await-dictionary`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/await-dictionary.d.ts)

## Examples
```js
await Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve(2),
  c: 3,
}); // => { a: 1, b: 2, c: 3 }

await Promise.allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.reject(2),
  c: 3,
}); // => { a: { status: "fulfilled", value: 1 }, b: { status: "rejected", reason: 2 }, c: { status: "fulfilled", value: 3 } }
```
