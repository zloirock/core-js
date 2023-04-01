---
category: feature
tag:
  - es-standard
---

# Collections

Core-JS uses native collections in most cases, just fixes methods / constructor, if it's required, and in old environments uses fast polyfill (O(1) lookup).

- [Map](#map)
- [Set](#set)
- [WeakMap](#weakmap)
- [WeakSet](#weakset)

## `Map`

### Module

[`es.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.js)

### Types

```ts
class Map<K, V> {
  constructor(iterable?: Iterable<[K, V]>);
  clear(): void;
  delete(key: any): boolean;
  forEach(
    callbackfn: (value: any, key: any, target: any) => void,
    thisArg: any
  ): void;
  get(key: any): any;
  has(key: any): boolean;
  set(key: any, val: any): this;
  values(): Iterator<V>;
  keys(): Iterator<K>;
  entries(): Iterator<[K, V]>;
  [Symbol.iterator](): Iterator<[K, V]>;
  readonly size: number;
}
```

### Entry points

```
core-js(-pure)/es|stable|actual|full/map
```

### Example

[_Example_](https://goo.gl/GWR7NI):

```js
let array = [1];

let map = new Map([
  ["a", 1],
  [42, 2],
]);
map.set(array, 3).set(true, 4);

console.log(map.size); // => 4
console.log(map.has(array)); // => true
console.log(map.has([1])); // => false
console.log(map.get(array)); // => 3
map.forEach((val, key) => {
  console.log(val); // => 1, 2, 3, 4
  console.log(key); // => 'a', 42, [1], true
});
map.delete(array);
console.log(map.size); // => 3
console.log(map.get(array)); // => undefined
console.log(Array.from(map)); // => [['a', 1], [42, 2], [true, 4]]

let map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);

for (let [key, value] of map) {
  console.log(key); // => 'a', 'b', 'c'
  console.log(value); // => 1, 2, 3
}
for (let value of map.values()) console.log(value); // => 1, 2, 3
for (let key of map.keys()) console.log(key); // => 'a', 'b', 'c'
for (let [key, value] of map.entries()) {
  console.log(key); // => 'a', 'b', 'c'
  console.log(value); // => 1, 2, 3
}
```

## `Set`

### Module

[`es.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.js)

### Types

```ts
class Set<T> {
  constructor(iterable?: Iterable<T>);
  readonly size: number;
  add(key: any): this;
  clear(): void;
  delete(key: any): boolean;
  forEach(
    callbackfn: (value: any, key: any, target: any) => void,
    thisArg: any
  ): void;
  has(key: any): boolean;
  values(): Iterator<T>;
  keys(): Iterator<T>;
  entries(): Iterator<[T, T]>;
  [Symbol.iterator](): Iterator<T>;
}
```

### Entry points

```
core-js(-pure)/es|stable|actual|full/set
```

### Example

[_Example_](https://goo.gl/bmhLwg):

```js
let set = new Set(["a", "b", "a", "c"]);
set.add("d").add("b").add("e");
console.log(set.size); // => 5
console.log(set.has("b")); // => true
set.forEach((it) => {
  console.log(it); // => 'a', 'b', 'c', 'd', 'e'
});
set.delete("b");
console.log(set.size); // => 4
console.log(set.has("b")); // => false
console.log(Array.from(set)); // => ['a', 'c', 'd', 'e']

let set = new Set([1, 2, 3, 2, 1]);

for (let value of set) console.log(value); // => 1, 2, 3
for (let value of set.values()) console.log(value); // => 1, 2, 3
for (let key of set.keys()) console.log(key); // => 1, 2, 3
for (let [key, value] of set.entries()) {
  console.log(key); // => 1, 2, 3
  console.log(value); // => 1, 2, 3
}
```

## `WeakMap`

### Module

[`es.weak-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.js)

### Types

```ts
class WeakMap<K extends object, V> {
  constructor(iterable?: Iterable<[K, V]>);
  delete(key: K): boolean;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, val: V): WeakMap<K, V>;
}
```

### Entry points

```
core-js(-pure)/es|stable|actual|full/weak-map
```

### Example

[_Example_](https://goo.gl/SILXyw):

```js
let a = [1];
let b = [2];
let c = [3];

let weakmap = new WeakMap([
  [a, 1],
  [b, 2],
]);
weakmap.set(c, 3).set(b, 4);
console.log(weakmap.has(a)); // => true
console.log(weakmap.has([1])); // => false
console.log(weakmap.get(a)); // => 1
weakmap.delete(a);
console.log(weakmap.get(a)); // => undefined

// Private properties store:
let Person = (() => {
  let names = new WeakMap();
  return class {
    constructor(name) {
      names.set(this, name);
    }
    getName() {
      return names.get(this);
    }
  };
})();

let person = new Person("Vasya");
console.log(person.getName()); // => 'Vasya'
for (let key in person) console.log(key); // => only 'getName'
```

## `WeakSet`

### Module

[`es.weak-set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-set.js)

### Types

```ts
class WeakSet<T extends object> {
  constructor(iterable?: Iterable<T>);
  add(key: T): WeakSet<K>;
  delete(key: T): boolean;
  has(key: T): boolean;
}
```

### Entry points

```
core-js(-pure)/es|stable|actual|full/weak-set
```

### Example

[_Example_](https://goo.gl/TdFbEx):

```js
let a = [1];
let b = [2];
let c = [3];

let weakset = new WeakSet([a, b, a]);
weakset.add(c).add(b).add(c);
console.log(weakset.has(b)); // => true
console.log(weakset.has([2])); // => false
weakset.delete(b);
console.log(weakset.has(b)); // => false
```

## Caveats when using collections polyfill

- Weak-collections polyfill stores values as hidden properties of keys. It works correctly and doesn't leak in most cases. However, it is desirable to store a collection longer than its keys.
