# `String` padding
[Specification](https://tc39.es/proposal-string-pad-start-end/)\
[Proposal repo](https://github.com/tc39/proposal-string-pad-start-end)

## Modules
[`es.string.pad-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-end.js) and [`es.string.pad-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.pad-start.js).

## Built-ins signatures
```ts
class String {
  padStart(length: number, fillStr?: string = ' '): string;
  padEnd(length: number, fillStr?: string = ' '): string;
}

```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-padding
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/pad-end
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/pad-start
```

## Examples
```js
'hello'.padStart(10);         // => '     hello'
'hello'.padStart(10, '1234'); // => '12341hello'
'hello'.padEnd(10);           // => 'hello     '
'hello'.padEnd(10, '1234');   // => 'hello12341'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-padding`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/string-padding.d.ts)
