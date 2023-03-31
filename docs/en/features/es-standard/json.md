---
category: feature
tag:
  - es-standard
---

# `JSON`

Since `JSON` object is missed only in very old engines like IE7-, Core-JS does not provide a full `JSON` polyfill, however, fix already existing implementations by the current standard, for example, [well-formed `JSON.stringify`](https://github.com/tc39/proposal-well-formed-stringify). `JSON` also fixed in other modules - for example, `Symbol` polyfill fixes `JSON.stringify` for correct work with symbols.

## Modules

- [`es.json.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.to-string-tag.js)
- [`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js)

## Types

```ts
interface JSON {
  stringify(
    value: any,
    replacer?:
      | Array<string | number>
      | ((key: string, value: any) => any)
      | null,
    space?: string | number
  ): string | void;
  [Symbol.toStringTag]: "JSON";
}
```

## Entry points

```
core-js(-pure)/es|stable|actual|full/json/stringify
core-js(-pure)/es|stable|actual|full/json/to-string-tag
```

## Example

[_Example_](https://is.gd/izZqKn):

```js
JSON.stringify({ "𠮷": ["\uDF06\uD834"] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```
