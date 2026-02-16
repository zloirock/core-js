# Idle Callback
[Specification](https://w3c.github.io/requestidlecallback/)\
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

Note that `requestIdleCallback`` cannot really be polyfilled as we don't know when an idle period happens.  However, the polyfill contained in core-js uses ``requestAnimationFrame`` to ensure that operations contained in ``requestIdleCallback`` will not significantly throttle the rendering of graphics.

## Modules 
[`web.request-idle-callback`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.request-idle-callback.js), [`web.cancel-idle-callback`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.cancel-idle-callback.js).

## Built-ins signatures
```ts
function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout: number }
): number;
function cancelIdleCallback(handle: number): void;
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full|web/request-idle-callback
core-js(-pure)/stable|actual|full|web/cancel-idle-callback
```
