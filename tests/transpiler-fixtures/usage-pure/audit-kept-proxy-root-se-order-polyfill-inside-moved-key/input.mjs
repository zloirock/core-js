// An instance call inside a retained realm key remains independently polyfilled behind the guard.
let c = 0;
export { c };
let y;
export const polyfillInsideMovedKey = (y = globalThis.window)?.[([c].flat(), 'self')].Array.prototype.some.call([1], v => v);
