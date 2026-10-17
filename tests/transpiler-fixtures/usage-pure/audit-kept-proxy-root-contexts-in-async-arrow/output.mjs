import _globalThis from "@core-js/pure/actual/global-this";
let r;
export const inAsyncArrow = (async () => (r = _globalThis.window)?.Array.prototype.some.call([1], it => it))();