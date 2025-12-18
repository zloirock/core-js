# queueMicrotask
[Specification](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask)

## Module 
[`web.queue-microtask`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.queue-microtask.js)

## Built-ins signatures
```ts
function queueMicrotask(fn: Function): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full/queue-microtask
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/web/queue-microtask`](https://github.com/zloirock/core-js/blob/v4-types/packages/core-js-types/src/base/web/queue-microtask.d.ts)

## Example
```js
queueMicrotask(() => console.log('called as microtask'));
```
