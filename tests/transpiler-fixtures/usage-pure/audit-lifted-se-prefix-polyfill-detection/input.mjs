// `(Promise.resolve(1).then(noop), globalThis)` - an SE prefix carrying polyfillable
// expressions inside the destructure init. when nested-proxy flatten lifts the SE prefix as a
// standalone statement (or preserves it via text in unplugin), the inner Promise reference
// must still get its polyfill emission. marking the whole declarator / init as skipped was
// over-aggressive and suppressed polyfill detection for SE-prefix exprs the flatten leaves behind
const noop = () => {};
const { Array: { from } } = (Promise.resolve(1).then(noop), globalThis);
export { from };
