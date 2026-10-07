// A `||` / `??` left read off the realm of a global core-js patches in place and ships no pure replacement of
// (`Number`, `RegExp`, the `Error` constructors, `ArrayBuffer`, `Uint8Array`) decides the selection as `Array`
// does: every engine carries it, so the right is dead - its constructor's modules stay out (`WeakSet`, `WeakMap`,
// `Iterator`, `DisposableStack`, `AsyncDisposableStack`) while the left's statics keep theirs; a disabled
// line injects nothing.
export const integer = (globalThis.Number || WeakSet).isInteger(1);
export const escaped = (globalThis.RegExp ?? WeakMap).escape('a.b');
export const errorCheck = (globalThis.TypeError || Iterator).isError(value);
export const view = 'isView' in (self.ArrayBuffer ?? DisposableStack);
export const fromHex = (globalThis.Uint8Array || AsyncDisposableStack).fromHex('ff');
// core-js-disable-next-line
export const kept = (globalThis.Number || Set).isNaN(value);
