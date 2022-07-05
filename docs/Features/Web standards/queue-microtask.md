# `queueMicrotask`
[Spec](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask), module [`web.queue-microtask`](/packages/core-js/modules/web.queue-microtask.js)
```js
function queueMicrotask(fn: Function): void;
```
[*CommonJS entry points:*](/docs/Usage.md#commonjs-api)
```js
core-js(-pure)/stable|actual|full/queue-microtask
```
[*Examples*](https://goo.gl/nsW8P9):
```js
queueMicrotask(() => console.log('called as microtask'));
```