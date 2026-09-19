# Idle Callback
[Specification](https://w3c.github.io/requestidlecallback/)\
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

Note that `requestIdleCallback` cannot really be polyfilled as we don't know when an idle period happens.  However, the polyfill contained in core-js uses `requestAnimationFrame` to ensure that operations contained in `requestIdleCallback` will not significantly throttle the rendering of graphics.

## Modules 
[`web.request-idle-callback`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.request-idle-callback.js)

## Built-ins signatures
```ts
function requestIdleCallback(
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout: number }
): number;
function cancelIdleCallback(handle: number): void;
interface IdleDeadline {
  timeRemaining(): number;
  readonly didTimeout: boolean;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/stable|actual|full|web/request-idle-callback
core-js(-pure)/stable|actual|full|web/cancel-idle-callback
core-js(-pure)/stable|actual|full|web/idle-deadline
```

- Some browsers (like Safari's Technical Preview) has only some components `requestIdleCallback`, `cancelIdleCallback`, and `IdleDeadline` exposed.  In this case, importing any of those functions will use polyfilled versions.
- Polyfilled versions are not compatible with browser native versions in terms of request / cancel.  Therefore it is strongly recommended to import all of the above-mentioned entry points together.
- Multiple polyfilled instances also do not have handles compatible with each other.

## Examples
```js
requestIdleCallback(
  deadline => {
    console.log('Did timeout:', deadline.didTimeout, '| Time remaining (ms):', deadline.timeRemaining());
  },
  { timeout: 2000 } // forces callback with timeout after 2 seconds max
);
```
