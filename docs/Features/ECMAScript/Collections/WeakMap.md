# ES WeakMap
Module [`es.weak-map`](/packages/core-js/modules/es.weak-map.js).
```js
class WeakMap {
  constructor(iterable?: Iterable<[key, value]>): WeakMap;
  delete(key: Object): boolean;
  get(key: Object): any;
  has(key: Object): boolean;
  set(key: Object, val: any): this;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js(-pure)/es|stable|actual|full/weak-map
```
[*Examples*](https://goo.gl/SILXyw):
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
  let names = new WeakMap;
  return class {
    constructor(name) {
      names.set(this, name);
    }
    getName() {
      return names.get(this);
    }
  }
})();

let person = new Person('Vasya');
console.log(person.getName());            // => 'Vasya'
for (let key in person) console.log(key); // => only 'getName'
```
