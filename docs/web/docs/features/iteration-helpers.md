# Iteration helpers
Helpers for checking iterability / get iterator in the `pure` version or, for example, for `arguments` object

## Built-ins signatures
```ts
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
@core-js/pure/es|stable|actual|full/is-iterable
@core-js/pure/es|stable|actual|full/get-iterator
@core-js/pure/es|stable|actual|full/get-iterator-method
```

## Examples
```ts
import isIterable from '@core-js/pure/actual/is-iterable';
import getIterator from '@core-js/pure/actual/get-iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';

let list = (function () {
  // eslint-disable-next-line prefer-rest-params -- example
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
console.log(typeof method);         // 'function'
iterator = method.call(list);
console.log(iterator.next().value); // 1
console.log(iterator.next().value); // 2
console.log(iterator.next().value); // 3
console.log(iterator.next().value); // undefined

console.log(getIteratorMethod({})); // undefined
```
