---
category: feature
tag:
  - helper
---

# Iteration helpers

在`纯净`版本或者例如 `arguments` 等对象中用于检查是否可以迭代或者获取迭代器的 helper：

## 类型

```ts
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```

## 入口点

```
core-js-pure/es|stable|actual|full/is-iterable
core-js-pure/es|stable|actual|full/get-iterator
core-js-pure/es|stable|actual|full/get-iterator-method
```

## 示例

[_示例_](https://goo.gl/SXsM6D):

```js
import isIterable from "core-js-pure/actual/is-iterable";
import getIterator from "core-js-pure/actual/get-iterator";
import getIteratorMethod from "core-js-pure/actual/get-iterator-method";

let list = (function () {
  return arguments;
})(1, 2, 3);

console.log(isIterable(list)); // true;

let iterator = getIterator(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

getIterator({}); // TypeError: [object Object] is not iterable!

let method = getIteratorMethod(list);
console.log(typeof method); // 'function'
let iterator = method.call(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

console.log(getIteratorMethod({})); // undefined
```
