---
category: feature
tag:
  - es-standard
---

# Collections

在大多数情况下 Core-JS 使用原生的 collections，只是修复了一些方法和构造函数，如果有需要的话，在老环境中使用快速的 polyfill（O(1)查找）。

- [Map](#map)
- [Set](#set)
- [WeakMap](#weakmap)
- [WeakSet](#weakset)

## `Map`

### 模块

[`es.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.map.js)

### 类型

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

### 入口点

```
core-js(-pure)/es|stable|actual|full/map
```

### 示例

[_示例_](https://goo.gl/GWR7NI):

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

### 模块

[`es.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.set.js)

### 类型

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
  [Symbol.iterator](): Iterator<value>;
  readonly attribute size: number;
}
```

### 入口点

```
core-js(-pure)/es|stable|actual|full/set
```

### 示例

[_示例_](https://goo.gl/bmhLwg):

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

### 模块

[`es.weak-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-map.js)

### 类型

```ts
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: Object): boolean;
  get(key: Object): any;
  has(key: Object): boolean;
  set(key: Object, val: any): this;
}
```

### 入口点

```
core-js(-pure)/es|stable|actual|full/weak-map
```

### 示例

[_示例_](https://goo.gl/SILXyw):

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

### 模块

[`es.weak-set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.weak-set.js)

### 类型

```ts
class WeakSet {
  constructor(iterable?: Iterable<value>): WeakSet;
  add(key: Object): this;
  delete(key: Object): boolean;
  has(key: Object): boolean;
}
```

### 入口点

```
core-js(-pure)/es|stable|actual|full/weak-set
```

### 示例

[_示例_](https://goo.gl/TdFbEx):

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

## 使用 collections polyfill 时的注意事项

- Weak-collections polyfill 把值作为键的隐藏属性储存。大多数情况下可以正常工作而且不会泄露。但储存比键更长的 collection 也是可以的。
