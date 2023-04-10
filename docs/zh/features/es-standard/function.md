---
category: feature
tag:
  - es-standard
---

# `Function`

## 模块

- [`es.function.name`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.name.js)
- [`es.function.has-instance`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.has-instance.js)

_仅 ES5:_

- [`es.function.bind`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.function.bind.js)

## 类型

```ts
interface Function {
  name: string;
  bind(thisArg: any, ...args: Array<any>): Function;
  [Symbol.hasInstance](value: any): boolean;
}
```

## 入口点

```
core-js/es|stable|actual|full/function
core-js/es|stable|actual|full/function/name
core-js/es|stable|actual|full/function/has-instance
core-js(-pure)/es|stable|actual|full/function/bind
core-js(-pure)/es|stable|actual|full/function/virtual/bind
```

## 示例

[_示例_](https://goo.gl/zqu3Wp):

```js
(function foo() {}).name; // => 'foo'

console.log.bind(console, 42)(43); // => 42 43
```
