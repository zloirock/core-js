# Idle Callback
[Specification](https://w3c.github.io/requestidlecallback/)\
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

Note that ``requestIdleCallback`` cannot really be polyfilled as we don't know when an idle period happens.  However, the polyfill contained in core-js uses ``requestAnimationFrame`` to ensure that operations contained in ``requestIdleCallback`` will not significantly throttle the rendering of graphics.

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

Moments in regards to usage of both functions together:
- Some browsers (like Safari's Technical Preview) has ``requestIdleCallback`` but not ``cancelIdleCallback``.  If either function is missing and the global version is used, importing either ``request-idle-callback`` or ``cancel-idle-callback`` will polyfill both functions.
- In the pure version, native functions are only used if the browser has both ``requestIdleCallback`` and ``cancelIdleCallback``; otherwise, the entry points both expose customly-polyfilled versions.
- Polyfilled versions of the functions cannot be used to cancel an idle callback scheduled through the browser's native interface; likewise, polyfilled versions cannot be used to schedule a callback that can be cancelled through native functions.

## Examples
```js
requestIdleCallback(
  deadline => {
    console.log('Did timeout:', deadline.didTimeout, '| Time remaining (ms):', deadline.timeRemaining());
  },
  { timeout: 2000 } // forces callback after 2 seconds max
);
```
