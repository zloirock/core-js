# Well-formed Unicode strings
[Specification](https://tc39.es/proposal-is-usv-string/)\
[Proposal repo](https://github.com/tc39/proposal-is-usv-string)

## Modules
[`es.string.is-well-formed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.is-well-formed.js) and [`es.string.to-well-formed`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.string.to-well-formed.js).

## Built-ins signatures
```ts
class String {
  isWellFormed(): boolean;
  toWellFormed(): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/well-formed-unicode-strings
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/is-well-formed
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/to-well-formed
```

## Examples
```js
'a💩b'.isWellFormed();      // => true
'a\uD83Db'.isWellFormed();  // => false

'a💩b'.toWellFormed();      // => 'a💩b'
'a\uD83Db'.toWellFormed();  // => 'a�b'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/well-formed-unicode-strings`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/well-formed-unicode-strings.d.ts)
