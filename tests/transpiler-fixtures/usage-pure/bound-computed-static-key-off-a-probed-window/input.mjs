// A static read by a bound computed key off a probed `window`: off-window the source throws destructuring
// `undefined`, which unplugin keeps while it binds the ponyfill (the sidecar), while babel binds the ponyfill
// alone and never throws - its debt.
const K = 'of';
const { [K]: f } = globalThis.window?.Array;
export { f };
