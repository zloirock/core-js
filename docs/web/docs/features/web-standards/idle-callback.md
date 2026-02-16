# Idle Callback
[Specification](https://w3c.github.io/requestidlecallback/)\
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

Note that `requestIdleCallback`` cannot really be polyfilled as we don't know when an idle period happens.  However, the polyfill contained in core-js uses ``requestAnimationFrame`` to ensure that operations contained in ``requestIdleCallback`` will not significantly throttle the rendering of graphics.

## Modules 
[`web.request-idle-callback`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.request-idle-callback.js), [`web.cancel-idle-callback`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.cancel-idle-callback.js).

Note that if using ``core-js-builder``, ``es.map`` must also be put in the ``modules`` list if you want to build for old browsers.

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

## Examples
```js
requestIdleCallback(
  deadline => {
    console.log('Did timeout:', deadline.didTimeout, '| Time remaining (ms):', deadline.timeRemaining());
  },
  { timeout: 2000 } // forces callback after 2 seconds max
);
```
