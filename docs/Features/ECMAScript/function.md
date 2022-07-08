# `Function`
Modules [`es.function.name`](/packages/core-js/modules/es.function.name.js), [`es.function.has-instance`](/packages/core-js/modules/es.function.has-instance.js). Just ES5: [`es.function.bind`](/packages/core-js/modules/es.function.bind.js).
```ts
class Function {
  name: string;
  bind(thisArg: any, ...args: Array<mixed>): Function;
  @@hasInstance(value: any): boolean;
}
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```
core-js/es|stable|actual|full/function
core-js/es|stable|actual|full/function/name
core-js/es|stable|actual|full/function/has-instance
core-js(-pure)/es|stable|actual|full/function/bind
core-js(-pure)/es|stable|actual|full/function/virtual/bind
```
[*Example*](https://goo.gl/zqu3Wp):
```js
(function foo() {}).name // => 'foo'

console.log.bind(console, 42)(43); // => 42 43
```
