# ECMAScript: Function

## Modules
[`es.function.name`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.name.js), [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.has-instance.js). Just ES5: [`es.function.bind`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.bind.js).

## Built-ins signatures
```ts
class Function {
  name: string;
  bind(thisArg: any, ...args: Array<mixed>): Function;
  @@hasInstance(value: any): boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js/es|stable|actual|full/function
core-js/es|stable|actual|full/function/name
core-js/es|stable|actual|full/function/has-instance
core-js(-pure)/es|stable|actual|full/function/bind
core-js(-pure)/es|stable|actual|full/function/virtual/bind
```

## Examples
```js
(function foo() { /* empty */ }).name; // => 'foo'

console.log.bind(console, 42)(43); // -> 42 43
```
