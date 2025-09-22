# ECMAScript: Collections
`core-js` uses native collections in most cases, just fixes methods / constructor, if it's required, and in the old environment uses fast polyfill (O(1) lookup).

## Map
### Modules 
[`es.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.js), [`es.map.group-by`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.group-by.js).

### Built-ins signatures
```ts
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
  static groupBy(items: Iterable, callbackfn: (value: any, index: number) => key): Map<key, Array<mixed>>;
}
```

### [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/map
core-js(-pure)/es|stable|actual|full/map/group-by
```

### Examples
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

map = new Map([['a', 1], ['b', 2], ['c', 3]]);

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

map = Map.groupBy([1, 2, 3, 4, 5], it => it % 2);
map.get(1); // => [1, 3, 5]
map.get(0); // => [2, 4]
```

## Set
### Modules 
[`es.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.js), [`es.set.difference.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.difference.v2.js), [`es.set.intersection.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.intersection.v2.js), [`es.set.is-disjoint-from.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-disjoint-from.v2.js), [`es.set.is-subset-of.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-subset-of.v2.js), [`es.set.is-superset-of.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.is-superset-of.v2.js), [`es.set.symmetric-difference.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.symmetric-difference.v2.js), [`es.set.union.v2`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.union.v2.js)

### Built-ins signatures
```ts
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
  difference(other: SetLike<mixed>): Set;
  intersection(other: SetLike<mixed>): Set;
  isDisjointFrom(other: SetLike<mixed>): boolean;
  isSubsetOf(other: SetLike<mixed>): boolean;
  isSupersetOf(other: SetLike<mixed>): boolean;
  symmetricDifference(other: SetLike<mixed>): Set;
  union(other: SetLike<mixed>): Set;
  @@iterator(): Iterator<value>;
  readonly attribute size: number;
}
```

### [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/set
core-js(-pure)/es|stable|actual|full/set/difference
core-js(-pure)/es|stable|actual|full/set/intersection
core-js(-pure)/es|stable|actual|full/set/is-disjoint-from
core-js(-pure)/es|stable|actual|full/set/is-subset-of
core-js(-pure)/es|stable|actual|full/set/is-superset-of
core-js(-pure)/es|stable|actual|full/set/symmetric-difference
core-js(-pure)/es|stable|actual|full/set/union
```

### Examples
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

set = new Set([1, 2, 3, 2, 1]);

for (let value of set) console.log(value);          // => 1, 2, 3
for (let value of set.values()) console.log(value); // => 1, 2, 3
for (let key of set.keys()) console.log(key);       // => 1, 2, 3
for (let [key, value] of set.entries()) {
  console.log(key);                                 // => 1, 2, 3
  console.log(value);                               // => 1, 2, 3
}

new Set([1, 2, 3]).union(new Set([3, 4, 5]));               // => Set {1, 2, 3, 4, 5}
new Set([1, 2, 3]).intersection(new Set([3, 4, 5]));        // => Set {3}
new Set([1, 2, 3]).difference(new Set([3, 4, 5]));          // => Set {1, 2}
new Set([1, 2, 3]).symmetricDifference(new Set([3, 4, 5])); // => Set {1, 2, 4, 5}
new Set([1, 2, 3]).isDisjointFrom(new Set([4, 5, 6]));      // => true
new Set([1, 2, 3]).isSubsetOf(new Set([5, 4, 3, 2, 1]));    // => true
new Set([5, 4, 3, 2, 1]).isSupersetOf(new Set([1, 2, 3]));  // => true
```

## WeakMap

### Modules
[`es.weak-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.js).

### Built-ins signatures
```ts
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: Object): boolean;
  get(key: Object): any;
  has(key: Object): boolean;
  set(key: Object, val: any): this;
}
```
### [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/weak-map
```

### Examples
```js
let a = [1];
let b = [2];
let c = [3];

let weakmap = new WeakMap([[a, 1], [b, 2]]);
weakmap.set(c, 3).set(b, 4);
console.log(weakmap.has(a));   // => true
console.log(weakmap.has([1])); // => false
console.log(weakmap.get(a));   // => 1
weakmap.delete(a);
console.log(weakmap.get(a));   // => undefined

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

let person = new Person('Vasya');
console.log(person.getName());            // => 'Vasya'
for (let key in person) console.log(key); // => only 'getName'
```

## WeakSet
### Modules 
[`es.weak-set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-set.js).

### Built-ins signatures
```ts
class WeakSet {
  constructor(iterable?: Iterable<value>): WeakSet;
  add(key: Object): this;
  delete(key: Object): boolean;
  has(key: Object): boolean;
}
```

### [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/weak-set
```
### Examples
```js
let a = [1];
let b = [2];
let c = [3];

let weakset = new WeakSet([a, b, a]);
weakset.add(c).add(b).add(c);
console.log(weakset.has(b));   // => true
console.log(weakset.has([2])); // => false
weakset.delete(b);
console.log(weakset.has(b));   // => false
```

> [!WARNING]
> - Weak-collections polyfill stores values as hidden properties of keys. It works correctly and does not leak in most cases. However, it is desirable to store a collection longer than its keys.
> - Native symbols as `WeakMap` keys can't be properly polyfilled without memory leaks.
