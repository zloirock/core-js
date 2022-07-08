# `Reflect`
Modules [`es.reflect.apply`](/packages/core-js/modules/es.reflect.apply.js), [`es.reflect.construct`](/packages/core-js/modules/es.reflect.construct.js), [`es.reflect.define-property`](/packages/core-js/modules/es.reflect.define-property.js), [`es.reflect.delete-property`](/packages/core-js/modules/es.reflect.delete-property.js), [`es.reflect.get`](/packages/core-js/modules/es.reflect.get.js), [`es.reflect.get-own-property-descriptor`](/packages/core-js/modules/es.reflect.get-own-property-descriptor.js), [`es.reflect.get-prototype-of`](/packages/core-js/modules/es.reflect.get-prototype-of.js), [`es.reflect.has`](/packages/core-js/modules/es.reflect.has.js), [`es.reflect.is-extensible`](/packages/core-js/modules/es.reflect.is-extensible.js), [`es.reflect.own-keys`](/packages/core-js/modules/es.reflect.own-keys.js), [`es.reflect.prevent-extensions`](/packages/core-js/modules/es.reflect.prevent-extensions.js), [`es.reflect.set`](/packages/core-js/modules/es.reflect.set.js), [`es.reflect.set-prototype-of`](/packages/core-js/modules/es.reflect.set-prototype-of.js).
```ts
namespace Reflect {
  apply(target: Function, thisArgument: any, argumentsList: Array<mixed>): any;
  construct(target: Function, argumentsList: Array<mixed>, newTarget?: Function): Object;
  defineProperty(target: Object, propertyKey: PropertyKey, attributes: PropertyDescriptor): boolean;
  deleteProperty(target: Object, propertyKey: PropertyKey): boolean;
  get(target: Object, propertyKey: PropertyKey, receiver?: any): any;
  getOwnPropertyDescriptor(target: Object, propertyKey: PropertyKey): PropertyDescriptor | void;
  getPrototypeOf(target: Object): Object | null;
  has(target: Object, propertyKey: PropertyKey): boolean;
  isExtensible(target: Object): boolean;
  ownKeys(target: Object): Array<string | symbol>;
  preventExtensions(target: Object): boolean;
  set(target: Object, propertyKey: PropertyKey, V: any, receiver?: any): boolean;
  setPrototypeOf(target: Object, proto: Object | null): boolean; // required __proto__ - IE11+
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
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
[*Examples*](https://goo.gl/gVT0cH):
```js
let object = { a: 1 };
Object.defineProperty(object, 'b', { value: 2 });
object[Symbol('c')] = 3;
Reflect.ownKeys(object); // => ['a', 'b', Symbol(c)]

function C(a, b) {
  this.c = a + b;
}

let instance = Reflect.construct(C, [20, 22]);
instance.c; // => 42
```
