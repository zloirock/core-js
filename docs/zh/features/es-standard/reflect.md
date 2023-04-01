---
category: feature
tag:
  - es-standard
---

# `Reflect`

## 模块

- [`es.reflect.apply`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.apply.js)
- [`es.reflect.construct`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.construct.js)
- [`es.reflect.define-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.define-property.js)
- [`es.reflect.delete-property`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.delete-property.js)
- [`es.reflect.get`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get.js)
- [`es.reflect.get-own-property-descriptor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-own-property-descriptor.js)
- [`es.reflect.get-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.get-prototype-of.js)
- [`es.reflect.has`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.has.js)
- [`es.reflect.is-extensible`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.is-extensible.js)
- [`es.reflect.own-keys`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.own-keys.js)
- [`es.reflect.prevent-extensions`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.prevent-extensions.js)
- [`es.reflect.set`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set.js)
- [`es.reflect.set-prototype-of`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.reflect.set-prototype-of.js)

## 类型

```ts
namespace Reflect {
  function apply(
    target: Function,
    thisArgument: any,
    argumentsList: Array<any>
  ): any;
  function construct<A extends readonly any[], R>(
    target: new (...args: A) => R,
    argumentsList: A,
    newTarget?: new (...args: any) => any
  ): Object;
  function defineProperty(
    target: Object,
    propertyKey: PropertyKey,
    attributes: PropertyDescriptor
  ): boolean;
  function deleteProperty(target: Object, propertyKey: PropertyKey): boolean;
  function get(target: Object, propertyKey: PropertyKey, receiver?: any): any;
  function getOwnPropertyDescriptor(
    target: Object,
    propertyKey: PropertyKey
  ): PropertyDescriptor | void;
  function getPrototypeOf(target: Object): Object | null;
  function has(target: Object, propertyKey: PropertyKey): boolean;
  function isExtensible(target: Object): boolean;
  function ownKeys(target: Object): Array<string | symbol>;
  function preventExtensions(target: Object): boolean;
  function set(
    target: Object,
    propertyKey: PropertyKey,
    value: any,
    receiver?: any
  ): boolean;
  function setPrototypeOf(target: Object, proto: Object | null): boolean; // required __proto__ - IE11+
}
```

## 入口点

```
core-js(-pure)/es|stable|actual|full/reflect
core-js(-pure)/es|stable|actual|full/reflect/apply
core-js(-pure)/es|stable|actual|full/reflect/construct
core-js(-pure)/es|stable|actual|full/reflect/define-property
core-js(-pure)/es|stable|actual|full/reflect/delete-property
core-js(-pure)/es|stable|actual|full/reflect/get
core-js(-pure)/es|stable|actual|full/reflect/get-own-property-descriptor
core-js(-pure)/es|stable|actual|full/reflect/get-prototype-of
core-js(-pure)/es|stable|actual|full/reflect/has
core-js(-pure)/es|stable|actual|full/reflect/is-extensible
core-js(-pure)/es|stable|actual|full/reflect/own-keys
core-js(-pure)/es|stable|actual|full/reflect/prevent-extensions
core-js(-pure)/es|stable|actual|full/reflect/set
core-js(-pure)/es|stable|actual|full/reflect/set-prototype-of
```

## 示例

[_示例_](https://goo.gl/gVT0cH):

```js
let object = { a: 1 };
Object.defineProperty(object, "b", { value: 2 });
object[Symbol("c")] = 3;
Reflect.ownKeys(object); // => ['a', 'b', Symbol(c)]

function C(a, b) {
  this.c = a + b;
}

let instance = Reflect.construct(C, [20, 22]);
instance.c; // => 42
```
