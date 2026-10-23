# `Symbol.prototype.description`
[Specification](https://tc39.es/proposal-Symbol-description/)\
[Proposal repo](https://github.com/tc39/proposal-Symbol-description)

## Modules
[`es.symbol.description`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.description.js).

## Built-ins signatures
```ts
class Symbol {
  readonly attribute description: string | void;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/symbol-description
core-js/es|stable|actual|full/symbol/description
```

## Examples
```js
Symbol('foo').description; // => 'foo'
Symbol().description;      // => undefined
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/symbol-description`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/symbol-description.d.ts)
