# `Object.values` / `Object.entries`
[Specification](https://tc39.es/proposal-object-values-entries/)\
[Proposal repo](https://github.com/tc39/proposal-object-values-entries)

## Modules
[`es.object.entries`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.entries.js) and [`es.object.values`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.values.js).

## Built-ins signatures
```ts
class Object {
  static entries(object: Object): Array<[string, mixed]>;
  static values(object: any): Array<mixed>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/object-values-entries
core-js(-pure)/es|stable|actual|full/object/entries
core-js(-pure)/es|stable|actual|full/object/values
```

## Examples
```js
Object.values({ a: 1, b: 2, c: 3 });  // => [1, 2, 3]
Object.entries({ a: 1, b: 2, c: 3 }); // => [['a', 1], ['b', 2], ['c', 3]]

for (let [key, value] of Object.entries({ a: 1, b: 2, c: 3 })) {
  console.log(key);   // -> 'a', 'b', 'c'
  console.log(value); // -> 1, 2, 3
}
```
