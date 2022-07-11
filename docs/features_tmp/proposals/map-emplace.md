# [`Map.prototype.emplace`](https://github.com/thumbsupep/proposal-upsert)
Modules [`esnext.map.emplace`](/packages/core-js/modules/esnext.map.emplace.js) and [`esnext.weak-map.emplace`](/packages/core-js/modules/esnext.weak-map.emplace.js)
```ts
class Map {
  emplace(key: any, { update: (value: any, key: any, handler: object) => updated: any, insert: (key: any, handler: object) => value: any): updated | value;
}

class WeakMap {
  emplace(key: any, { update: (value: any, key: any, handler: object) => updated: any, insert: (key: any, handler: object) => value: any): updated | value;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/map-upsert-stage-2
core-js(-pure)/full/map/emplace
core-js(-pure)/full/weak-map/emplace
```
[*Examples*](https://is.gd/ty5I2v):
```js
const map = new Map([['a', 2]]);

map.emplace('a', { update: it => it ** 2, insert: () => 3}); // => 4

map.emplace('b', { update: it => it ** 2, insert: () => 3}); // => 3

console.log(map); // => Map { 'a': 4, 'b': 3 }
```
