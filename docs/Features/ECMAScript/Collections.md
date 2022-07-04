# ES Map
Module [`es.map`](/packages/core-js/modules/es.map.js).
```js
class Map {
  constructor(iterable?: Iterable<[key, value]>): Map;
  clear(): void;
  delete(key: any): boolean;
  forEach(callbackfn: (value: any, key: any, target: any) => void, thisArg: any): void;
  get(key: any): any;
  has(key: any): boolean;
  set(key: any, val: any): this;
  values(): Iterator<value>;
  keys(): Iterator<key>;
  entries(): Iterator<[key, value]>;
  @@iterator(): Iterator<[key, value]>;
  readonly attribute size: number;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/map
```
[*Examples*](https://goo.gl/GWR7NI):
```js
let array = [1];

let map = new Map([['a', 1], [42, 2]]);
map.set(array, 3).set(true, 4);

console.log(map.size);        // => 4
console.log(map.has(array));  // => true
console.log(map.has([1]));    // => false
console.log(map.get(array));  // => 3
map.forEach((val, key) => {
  console.log(val);           // => 1, 2, 3, 4
  console.log(key);           // => 'a', 42, [1], true
});
map.delete(array);
console.log(map.size);        // => 3
console.log(map.get(array));  // => undefined
console.log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]

let map = new Map([['a', 1], ['b', 2], ['c', 3]]);

for (let [key, value] of map) {
  console.log(key);                                 // => 'a', 'b', 'c'
  console.log(value);                               // => 1, 2, 3
}
for (let value of map.values()) console.log(value); // => 1, 2, 3
for (let key of map.keys()) console.log(key);       // => 'a', 'b', 'c'
for (let [key, value] of map.entries()) {
  console.log(key);                                 // => 'a', 'b', 'c'
  console.log(value);                               // => 1, 2, 3
}
```
# ES Set
Module [`es.set`](/packages/core-js/modules/es.set.js).
```js
class Set {
  constructor(iterable?: Iterable<value>): Set;
  add(key: any): this;
  clear(): void;
  delete(key: any): boolean;
  forEach((value: any, key: any, target: any) => void, thisArg: any): void;
  has(key: any): boolean;
  values(): Iterator<value>;
  keys(): Iterator<value>;
  entries(): Iterator<[value, value]>;
  @@iterator(): Iterator<value>;
  readonly attribute size: number;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/set
```
[*Examples*](https://goo.gl/bmhLwg):
```js
let set = new Set(['a', 'b', 'a', 'c']);
set.add('d').add('b').add('e');
console.log(set.size);        // => 5
console.log(set.has('b'));    // => true
set.forEach(it => {
  console.log(it);            // => 'a', 'b', 'c', 'd', 'e'
});
set.delete('b');
console.log(set.size);        // => 4
console.log(set.has('b'));    // => false
console.log(Array.from(set)); // => ['a', 'c', 'd', 'e']

let set = new Set([1, 2, 3, 2, 1]);

for (let value of set) console.log(value);          // => 1, 2, 3
for (let value of set.values()) console.log(value); // => 1, 2, 3
for (let key of set.keys()) console.log(key);       // => 1, 2, 3
for (let [key, value] of set.entries()) {
  console.log(key);                                 // => 1, 2, 3
  console.log(value);                               // => 1, 2, 3
}
```
