# `globalThis`
[Specification](https://tc39.es/proposal-global/)\
[Proposal repo](https://github.com/tc39/proposal-global)

## Modules
[`es.global-this`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.global-this.js).

## Built-ins signatures
```ts
let globalThis: GlobalThisValue;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/global-this
{ core-js, @core-js/pure }/es|stable|actual|full/global-this
```

## Examples
```js
globalThis.Array === Array; // => true
```
