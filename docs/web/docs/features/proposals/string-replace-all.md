# `String.prototype.replaceAll`
[Specification](https://tc39.es/proposal-string-replaceall/)\
[Proposal repo](https://github.com/tc39/proposal-string-replaceall)

## Modules
[`es.string.replace-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.replace-all.js).

## Built-ins signatures
```ts
class String {
  replaceAll(searchValue: string | RegExp, replaceString: string | (searchValue, index, this) => string): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-replace-all
{ core-js, @core-js/pure }/es|stable|actual|full/string(/prototype)/replace-all
```

## Examples
```js
'Test abc test test abc test.'.replaceAll('abc', 'foo'); // => 'Test foo test test foo test.'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-replace-all`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/string-replace-all.d.ts)
