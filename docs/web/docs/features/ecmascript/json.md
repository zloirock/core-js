# ECMAScript: JSON
Since `JSON` object is missed only in very old engines like IE7-, `core-js` does not provide a full `JSON` polyfill, however, fix already existing implementations by the current standard, for example, [well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify). `JSON` is also fixed in other modules - for example, `Symbol` polyfill fixes `JSON.stringify` for correct work with symbols.

## Modules
[`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.json.to-string-tag.js) and [`es.json.stringify`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.json.stringify.js).

## Built-ins signatures
```ts
namespace JSON {
  stringify(value: any, replacer?: Array<string | number> | (this: any, key: string, value: any) => any, space?: string | number): string | void;
  @@toStringTag: 'JSON';
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/json/stringify
```

## Examples
```js
JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```
