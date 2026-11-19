# Object.keysLength
[Specification](https://tc39.es/proposal-object-keys-length/)\
[Proposal repo](https://github.com/tc39/proposal-object-keys-length)

## Modules
[`esnext.object.keys-length`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.object.keys-length.js)

## Built-ins signatures
```ts
class Object {
  static keysLength(obj: Object): number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/object-keys-length
{ core-js, @core-js/pure }/full/object/keys-length
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/object-keys-length`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/object-keys-length.d.ts)

## Examples
```js
Object.keysLength({ a: 1, b: 2 }); // => 2
```
