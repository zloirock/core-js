# Accessible `Object.prototype.hasOwnProperty`
[Specification](https://tc39.es/proposal-accessible-object-hasownproperty/)\
[Proposal repo](https://github.com/tc39/proposal-accessible-object-hasownproperty)

## Modules
[`es.object.has-own`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.object.has-own.js).

## Built-ins signatures
```ts
class Object {
  static hasOwn(object: object, key: PropertyKey): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/accessible-object-hasownproperty
core-js(-pure)/es|stable|actual|full/object/has-own
```

## Examples
```js
Object.hasOwn({ foo: 42 }, 'foo'); // => true
Object.hasOwn({ foo: 42 }, 'bar'); // => false
Object.hasOwn({}, 'toString');     // => false
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/accessible-object-hasownproperty`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/accessible-object-hasownproperty.d.ts)
