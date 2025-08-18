# `setTimeout` and `setInterval`

## Module 
[`web.timers`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.timers.js). Additional arguments fix for IE9-.

## Built-ins Signatures
```ts
function setTimeout(callback: any, time: any, ...args: Array<mixed>): number;
function setInterval(callback: any, time: any, ...args: Array<mixed>): number;
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js(-pure)/stable|actual|full/set-timeout
core-js(-pure)/stable|actual|full/set-interval
```

## Examples
```js
// Before:
setTimeout(console.log.bind(null, 41), 1000);
// After:
setTimeout(console.log, 1000, 42);
```
