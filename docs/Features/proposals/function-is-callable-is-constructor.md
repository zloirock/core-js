# [`Function.{ isCallable, isConstructor }`](https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md)

Modules [`esnext.function.is-callable`](/packages/core-js/modules/esnext.function.is-callable.js), [`esnext.function.is-constructor`](/packages/core-js/modules/esnext.function.is-constructor.js)
```ts
class Function {
  static isCallable(value: any): boolean;
  static isConstructor(value: any): boolean;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/proposals/function-is-callable-is-constructor
core-js(-pure)/full/function/is-callable
core-js(-pure)/full/function/is-constructor
```
[*Examples*](https://is.gd/Kof1he):
```js
Function.isCallable(null);           // => false
Function.isCallable({});             // => false
Function.isCallable(function () {}); // => true
Function.isCallable(() => {});       // => true
Function.isCallable(class {});       // => false

Function.isConstructor(null);           // => false
Function.isConstructor({});             // => false
Function.isConstructor(function () {}); // => true
Function.isConstructor(() => {});       // => false
Function.isConstructor(class {});       // => true
```
