# Iteration helpers
Helpers for checking iterability / getting an iterator in the `pure` version or, for example, for the `arguments` object

## Built-ins signatures
```ts
function isIterable(value: any): boolean;
function getIterator(value: any): Object;
function getIteratorMethod(value: any): Function | void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
{ core-js, @core-js/pure }/es|stable|actual|full/is-iterable
{ core-js, @core-js/pure }/es|stable|actual|full/get-iterator
{ core-js, @core-js/pure }/es|stable|actual|full/get-iterator-method
```

## Examples
```ts
import isIterable from '@core-js/pure/actual/is-iterable';
import getIterator from '@core-js/pure/actual/get-iterator';
import getIteratorMethod from '@core-js/pure/actual/get-iterator-method';

let list = (function () {
  return arguments;
})(1, 2, 3);

isIterable(list); // => true

let iterator = getIterator(list);
iterator.next().value; // => 1
iterator.next().value; // => 2
iterator.next().value; // => 3
iterator.next().value; // => undefined

getIterator({}); // => TypeError: [object Object] is not iterable

let method = getIteratorMethod(list);
typeof method;         // => 'function'
iterator = method.call(list);
iterator.next().value; // => 1
iterator.next().value; // => 2
iterator.next().value; // => 3
iterator.next().value; // => undefined

getIteratorMethod({}); // => undefined
```
