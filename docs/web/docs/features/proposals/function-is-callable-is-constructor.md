# Function.{ isCallable, isConstructor }
[Proposal repo](https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md)

## Modules
[`esnext.function.is-callable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.is-callable.js), [`esnext.function.is-constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.is-constructor.js)

## Built-ins signatures
```ts
class Function {
  static isCallable(value: any): boolean;
  static isConstructor(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/function-is-callable-is-constructor
core-js(-pure)/full/function/is-callable
core-js(-pure)/full/function/is-constructor
```

## Examples
```js
/* eslint-disable prefer-arrow-callback -- example */
Function.isCallable(null);                        // => false
Function.isCallable({});                          // => false
Function.isCallable(function () { /* empty */ }); // => true
Function.isCallable(() => { /* empty */ });       // => true
Function.isCallable(class { /* empty */ });       // => false

Function.isConstructor(null);                        // => false
Function.isConstructor({});                          // => false
Function.isConstructor(function () { /* empty */ }); // => true
Function.isConstructor(() => { /* empty */ });       // => false
Function.isConstructor(class { /* empty */ });       // => true
```
