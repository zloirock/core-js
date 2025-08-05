# queueMicrotask
[Specification](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## Module 
[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js)

```ts
function queueMicrotask(fn: Function): void;
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js(-pure)/stable|actual|full/queue-microtask
```

## Example
```js
queueMicrotask(() => console.log('called as microtask'));
```
