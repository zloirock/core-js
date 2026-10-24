# Well-formed `JSON.stringify`
[Specification](https://tc39.es/proposal-well-formed-stringify/)\
[Proposal repo](https://github.com/tc39/proposal-well-formed-stringify)

## Modules
[`es.json.stringify`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.json.stringify.js).

## Built-ins signatures
```ts
namespace JSON {
  stringify(target: any, replacer?: Function | Array, space?: string | number): string | void;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/well-formed-stringify
{ core-js, @core-js/pure }/es|stable|actual|full/json/stringify
```

## Examples
```js
JSON.stringify({ '𠮷': ['\uDF06\uD834'] }); // => '{"𠮷":["\\udf06\\ud834"]}'
```
