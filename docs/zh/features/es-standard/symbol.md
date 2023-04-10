---
category: feature
tag:
  - es-standard
---

# `Symbol`

## 模块

- [`es.symbol`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.js)
- [`es.symbol.async-iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.async-iterator.js)
- [`es.symbol.description`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.description.js)
- [`es.symbol.has-instance`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.has-instance.js)
- [`es.symbol.is-concat-spreadable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.is-concat-spreadable.js)
- [`es.symbol.iterator`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.iterator.js)
- [`es.symbol.match`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.match.js)
- [`es.symbol.replace`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.replace.js)
- [`es.symbol.search`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.search.js)
- [`es.symbol.species`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.species.js)
- [`es.symbol.split`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.split.js)
- [`es.symbol.to-primitive`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.to-primitive.js)
- [`es.symbol.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.to-string-tag.js)
- [`es.symbol.unscopables`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.symbol.unscopables.js)
- [`es.math.to-string-tag`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.math.to-string-tag.js)

## 类型

```ts
class Symbol {
  constructor(description?: string);
  readonly description: string | void;
  static readonly asyncIterator: unique symbol;
  static readonly hasInstance: unique symbol;
  static readonly isConcatSpreadable: unique symbol;
  static readonly iterator: unique symbol;
  static readonly match: unique symbol;
  static readonly replace: unique symbol;
  static readonly search: unique symbol;
  static readonly species: unique symbol;
  static readonly split: unique symbol;
  static readonly toPrimitive: unique symbol;
  static readonly toStringTag: unique symbol;
  static readonly unscopables: unique symbol;
  static for(key: string): symbol;
  static keyFor(sym: symbol): string | undefined;
  static useSimple(): void;
  static useSetter(): void;
}

interface ObjectConstructor {
  getOwnPropertySymbols(object: any): Array<symbol>;
}
```

也包装了一些正确使用 `Symbol` polyfill 的方法。

```ts
class Object {
  static create(prototype: Object | null, properties?: { [property: PropertyKey]: PropertyDescriptor }): Object;
  static defineProperties(object: Object, properties: { [property: PropertyKey]: PropertyDescriptor })): Object;
  static defineProperty(object: Object, property: PropertyKey, attributes: PropertyDescriptor): Object;
  static getOwnPropertyDescriptor(object: any, property: PropertyKey): PropertyDescriptor | void;
  static getOwnPropertyNames(object: any): Array<string>;
  propertyIsEnumerable(key: PropertyKey): boolean;
}
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/symbol
core-js(-pure)/es|stable|actual|full/symbol/async-iterator
core-js/es|stable|actual|full/symbol/description
core-js(-pure)/es|stable|actual|full/symbol/has-instance
core-js(-pure)/es|stable|actual|full/symbol/is-concat-spreadable
core-js(-pure)/es|stable|actual|full/symbol/iterator
core-js(-pure)/es|stable|actual|full/symbol/match
core-js(-pure)/es|stable|actual|full/symbol/replace
core-js(-pure)/es|stable|actual|full/symbol/search
core-js(-pure)/es|stable|actual|full/symbol/species
core-js(-pure)/es|stable|actual|full/symbol/split
core-js(-pure)/es|stable|actual|full/symbol/to-primitive
core-js(-pure)/es|stable|actual|full/symbol/to-string-tag
core-js(-pure)/es|stable|actual|full/symbol/unscopables
core-js(-pure)/es|stable|actual|full/symbol/for
core-js(-pure)/es|stable|actual|full/symbol/key-for
core-js(-pure)/es|stable|actual|full/object/get-own-property-symbols
core-js(-pure)/es|stable|actual|full/math/to-string-tag
```

## 示例

[_基础示例_](https://goo.gl/BbvWFc):

```js
let Person = (() => {
  let NAME = Symbol("name");
  return class {
    constructor(name) {
      this[NAME] = name;
    }
    getName() {
      return this[NAME];
    }
  };
})();

let person = new Person("Vasya");
console.log(person.getName()); // => 'Vasya'
console.log(person["name"]); // => undefined
console.log(person[Symbol("name")]); // => undefined, symbols are uniq
for (let key in person) console.log(key); // => nothing, symbols are not enumerable
```

`Symbol.for` & `Symbol.keyFor` [_example_](https://goo.gl/0pdJjX):

```js
let symbol = Symbol.for("key");
symbol === Symbol.for("key"); // true
Symbol.keyFor(symbol); // 'key'
```

含有获取自身对象键的方法的[_示例_](https://goo.gl/mKVOQJ)：

```js
let object = { a: 1 };
Object.defineProperty(object, "b", { value: 2 });
object[Symbol("c")] = 3;
Object.keys(object); // => ['a']
Object.getOwnPropertyNames(object); // => ['a', 'b']
Object.getOwnPropertySymbols(object); // => [Symbol(c)]
Reflect.ownKeys(object); // => ['a', 'b', Symbol(c)]
```

[_Symbol#description getter_](https://goo.gl/MWizfc):

```js
Symbol("foo").description; // => 'foo'
Symbol().description; // => undefined
```

## 使用 `Symbol` polyfill 时的注意事项：

- 我们无法添加新的原始类型，`Symbol` 返回的是对象。
- `Symbol.for` 和 `Symbol.keyFor` 不能被跨域 polyfill。
- 默认情况下，`Symbol` polyfill 在 `Object.prototype` 中定义了 setter 来隐藏键。因此，不受控制的 symbol 创建可能导致内存泄漏，并且 `in` 操作符目前对 `Symbol` polyfill 无效（例如 `Symbol() in {}` 返回 true）。

你可以在 `Object.prototype` 中禁止定义 setter。[示例](https://goo.gl/N5UD7J)：

```js
Symbol.useSimple();
let symbol1 = Symbol("symbol1");
let object1 = {};
object1[symbol1] = true;
for (let key in object1) console.log(key); // => 'Symbol(symbol1)_t.qamkg9f3q', w/o native Symbol

Symbol.useSetter();
let symbol2 = Symbol("symbol2");
let object2 = {};
object2[symbol2] = true;
for (let key in object2) console.log(key); // 什么都没有
```

- 目前 Core-JS 没有为了使像 `Symbol.iterator in foo` 这样的 `Object.prototype` 著名 symbol 正常工作而加入 setter。它们可枚举的特性可能造成问题。
- 环境外的对象可能有问题（比如 IE 的 `localStorage`）。
