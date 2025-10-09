# `JSON.parse` source text access
[Specification](https://tc39.es/proposal-json-parse-with-source/)\
[Proposal repo](https://github.com/tc39/proposal-json-parse-with-source)

## Modules
[`es.json.is-raw-json`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.json.is-raw-json.js), [`es.json.parse`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.json.parse.js), [`es.json.raw-json`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.json.raw-json.js).

## Built-ins signatures
```ts
namespace JSON {
  isRawJSON(O: any): boolean;
  // patched for source support
  parse(text: string, reviver?: (this: any, key: string, value: any, context: { source?: string }) => any): any;
  rawJSON(text: any): RawJSON;
  // patched for `JSON.rawJSON` support
  stringify(value: any, replacer?: Array<string | number> | (this: any, key: string, value: any) => any, space?: string | number): string | void;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/json-parse-with-source
core-js(-pure)/es|stable|actual|full/json/is-raw-json
core-js(-pure)/es|stable|actual|full/json/parse
core-js(-pure)/es|stable|actual|full/json/raw-json
core-js(-pure)/es|stable|actual|full/json/stringify
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

const embedded = JSON.stringify({ tooBigForNumber }, bigIntToRawJSON);
embedded === '{"tooBigForNumber":9007199254740993}'; // => true
```
