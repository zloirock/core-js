# `String.prototype.{ trimStart, trimEnd }`
[Specification](https://tc39.es/proposal-string-left-right-trim/)\
[Proposal repo](https://github.com/tc39/proposal-string-left-right-trim)

## Modules
[`es.string.trim-end`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-end.js) and [`es.string.trim-start`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.trim-start.js).

## Built-ins signatures
```ts
class String {
  trimLeft(): string;
  trimRight(): string;
  trimStart(): string;
  trimEnd(): string;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/string-left-right-trim
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/trim-end
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/trim-left
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/trim-right
{ core-js, @core-js/pure }/es|stable|actual|full/string(/virtual)/trim-start
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/string-left-right-trim`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/string-left-right-trim.d.ts)

## Examples
```js
'   hello   '.trimLeft();  // => 'hello   '
'   hello   '.trimRight(); // => '   hello'
'   hello   '.trimStart(); // => 'hello   '
'   hello   '.trimEnd();   // => '   hello'
```
