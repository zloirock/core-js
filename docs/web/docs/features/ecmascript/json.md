# ECMAScript: JSON
Since `JSON` object is missed only in very old engines like IE7-, `core-js` does not provide a full `JSON.{ parse, stringify }` polyfill, however, fix already existing implementations by the current standard.

## Modules
[`es.json.is-raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.is-raw-json.js), [`es.json.parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.parse.js), [`es.json.raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.raw-json.js), [`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js) and [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.to-string-tag.js).

## Built-ins signatures
```ts
namespace JSON {
  isRawJSON(O: any): boolean;
  parse(text: string, reviver?: (this: any, key: string, value: any, context: { source?: string }) => any): any;
  rawJSON(text: any): RawJSON;
  stringify(value: any, replacer?: Array<string | number> | (this: any, key: string, value: any) => any, space?: string | number): string | void;
  @@toStringTag: 'JSON';
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/es|stable|actual|full/json/is-raw-json
core-js(-pure)/es|stable|actual|full/json/parse
core-js(-pure)/es|stable|actual|full/json/raw-json
core-js(-pure)/es|stable|actual|full/json/to-string-tag
```

## Examples
```js
function digitsToBigInt(key, val, { source }) {
  return /^\d+$/.test(source) ? BigInt(source) : val;
}

function bigIntToRawJSON(key, val) {
  return typeof val === 'bigint' ? JSON.rawJSON(String(val)) : val;
}

const tooBigForNumber = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
JSON.parse(String(tooBigForNumber), digitsToBigInt) === tooBigForNumber; // => true

const wayTooBig = BigInt(`1${ '0'.repeat(1000) }`);
JSON.parse(String(wayTooBig), digitsToBigInt) === wayTooBig; // => true

JSON.stringify({ tooBigForNumber }, bigIntToRawJSON); // => '{"tooBigForNumber":9007199254740993}'

JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```
