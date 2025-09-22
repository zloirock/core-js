# setImmediate

## Module 
[`web.immediate`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.immediate.js). [`setImmediate`](https://w3c.github.io/setImmediate/) polyfill.

## Built-ins signatures
```ts
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```

## Examples
```js
setImmediate((arg1, arg2) => {
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(() => {
  console.log('Message will not be displayed');
}));
```
