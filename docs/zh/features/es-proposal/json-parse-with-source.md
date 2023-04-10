---
category: feature
tag:
  - es-proposal
---

# [`JSON.parse` 源文本访问](https://github.com/tc39/proposal-json-parse-with-source)

## 模块

- [`esnext.json.is-raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.json.is-raw-json.js)
- [`esnext.json.parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.json.parse.js)
- [`esnext.json.raw-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.json.raw-json.js)

## 类型

```ts
interface JSON {
  isRawJSON(O: any): boolean;
  // patched for source support
  parse(
    text: string,
    reviver?: (
      this: any,
      key: string,
      value: any,
      context: { source?: string }
    ) => any
  ): any;
  rawJSON(text: any): { rawJSON: string };
  // patched for `JSON.rawJSON` support
  stringify(
    value: any,
    replacer?:
      | Array<string | number>
      | ((this: any, key: string, value: any) => any),
    space?: string | number
  ): string | void;
}
```

## 入口点

```
core-js/proposals/json-parse-with-source
core-js(-pure)/actual|full/json/is-raw-json
core-js(-pure)/actual|full/json/parse
core-js(-pure)/actual|full/json/raw-json
core-js(-pure)/actual|full/json/stringify
```

## 示例

[_示例_](https://tinyurl.com/22phm569):

```js
function digitsToBigInt(key, val, { source }) {
  return /^[0-9]+$/.test(source) ? BigInt(source) : val;
}
function bigIntToRawJSON(key, val) {
  return typeof val === "bigint" ? JSON.rawJSON(String(val)) : val;
}
const tooBigForNumber = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
JSON.parse(String(tooBigForNumber), digitsToBigInt) === tooBigForNumber; // true
const wayTooBig = BigInt("1" + "0".repeat(1000));
JSON.parse(String(wayTooBig), digitsToBigInt) === wayTooBig; // true
const embedded = JSON.stringify({ tooBigForNumber }, bigIntToRawJSON);
embedded === '{"tooBigForNumber":9007199254740993}'; // true
```
