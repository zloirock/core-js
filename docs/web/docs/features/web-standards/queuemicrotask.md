# queueMicrotask
[Specification](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## Module 
[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js)

## Built-ins signatures
```ts
function queueMicrotask(fn: Function): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js(-pure)/stable|actual|full/queue-microtask
```

## Example
```js
queueMicrotask(() => console.log('called as microtask'));
```
