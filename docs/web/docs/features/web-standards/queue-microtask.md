# queueMicrotask
[Specification](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## Modules
[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.queue-microtask.js).

## Built-ins signatures
```ts
function queueMicrotask(fn: Function): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/queue-microtask
```

## Examples
```js
queueMicrotask(() => console.log('called as microtask'));
```
