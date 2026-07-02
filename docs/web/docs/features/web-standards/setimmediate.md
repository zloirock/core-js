# setImmediate

## Module 
[`web.set-immediate`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.set-immediate.js) and [`web.clear-immediate`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.clear-immediate.js). [`setImmediate`](https://w3c.github.io/setImmediate/) polyfill.

## Built-ins signatures
```ts
function setImmediate(callback: any, ...args: Array<mixed>): number;
function clearImmediate(id: number): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/set-immediate
core-js(-pure)/stable|actual|full/clear-immediate
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/web/efficient-script-yielding`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/web/efficient-script-yielding.d.ts)

## Examples
```js
setImmediate((arg1, arg2) => {
  console.log(arg1, arg2); // => Message will be displayed with minimum delay
}, 'Message will be displayed', 'with minimum delay');

clearImmediate(setImmediate(() => {
  console.log('Message will not be displayed');
}));
```
