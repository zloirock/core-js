# [`Array.isTemplateObject`](https://github.com/tc39/proposal-array-is-template-object)
Module [`esnext.array.is-template-object`](/packages/core-js/modules/esnext.array.is-template-object.js)
```ts
class Array {
  static isTemplateObject(value: any): boolean
}
```
[*CommonJS entry points:*](/docs/usage.md#commonjs-api)
```
core-js/proposals/array-is-template-object
core-js(-pure)/full/array/is-template-object
```
*Example*:
```js
console.log(Array.isTemplateObject((it => it)`qwe${ 123 }asd`)); // => true
```
