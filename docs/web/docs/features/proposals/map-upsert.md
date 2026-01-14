# `Map` upsert
[Specification](https://tc39.es/proposal-upsert/)\
[Proposal repo](https://github.com/thumbsupep/proposal-upsert)

## Modules 
[`es.map.get-or-insert`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.get-or-insert.js), [`es.map.get-or-insert-computed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.get-or-insert-computed.js), [`es.weak-map.get-or-insert`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.get-or-insert.js) and [`es.weak-map.get-or-insert-computed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.get-or-insert-computed.js).

## Built-ins signatures
```ts
class Map {
  getOrInsert(key: object | symbol, value: any): any;
  getOrInsertComputed(key: object | symbol, (key: any) => value: any): any;
}

class WeakMap {
  getOrInsert(key: object | symbol, value: any): any;
  getOrInsertComputed(key: object | symbol, (key: any) => value: any): any;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/map-upsert-v4
core-js(-pure)/es|stable|actual|full/map/get-or-insert
core-js(-pure)/es|stable|actual|full/map/get-or-insert-computed
core-js(-pure)/es|stable|actual|full/weak-map/get-or-insert
core-js(-pure)/es|stable|actual|full/weak-map/get-or-insert-computed
```

## Examples
```js
const map = new Map([['a', 1]]);

map.getOrInsert('a', 2); // => 1

map.getOrInsert('b', 3); // => 3

map.getOrInsertComputed('a', key => key); // => 1

map.getOrInsertComputed('c', key => key); // => 'c'

console.log(map); // => Map { 'a': 1, 'b': 3, 'c': 'c' }
```
