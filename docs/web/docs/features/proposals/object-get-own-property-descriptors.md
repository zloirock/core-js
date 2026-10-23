# `Object.getOwnPropertyDescriptors`
[Specification](https://tc39.es/proposal-object-getownpropertydescriptors/)\
[Proposal repo](https://github.com/tc39/proposal-object-getownpropertydescriptors)

## Modules
[`es.object.get-own-property-descriptors`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.get-own-property-descriptors.js).

## Built-ins signatures
```ts
class Object {
  static getOwnPropertyDescriptors(object: any): { [property: PropertyKey]: PropertyDescriptor };
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/object-getownpropertydescriptors
core-js(-pure)/es|stable|actual|full/object/get-own-property-descriptors
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/object-getownpropertydescriptors`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/object-get-own-property-descriptors.d.ts)

## Examples
```js
const object = { a: '1' };
Object.defineProperty(object, 'notWritable', { value: true, writable: false, enumerable: true });
// Shallow object cloning with prototype and descriptors:
Object.create(Object.getPrototypeOf(object), Object.getOwnPropertyDescriptors(object)); // => { a: '1', notWritable: true }

const target = { a: '9' };
const source = { b: '8' };
Object.defineProperty(source, 'notWritable', { value: true, writable: false, enumerable: true });
// Mixin:
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); // => { a: '9', b: '8', notWritable: true }
```
