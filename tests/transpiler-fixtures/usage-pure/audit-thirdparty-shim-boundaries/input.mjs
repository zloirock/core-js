// third-party shim writes with distinct routing:
// - a PROTOTYPE shim is invisible to the static mutation model; instance dispatch keeps the
//   runtime-guarded polyfill helper
// - a WHOLE-CONSTRUCTOR replacement via the global object patches the real slot, yet ctor and
//   static reads keep the ponyfill - the shim is dead code, core-js serves the calls
// - a CUSTOM-key shim routes like any mutation: write, read and cleanup share one object
String.prototype.padStart = shimPadStart;
export const r1 = s.padStart(3, '0');
window.Promise = window.Promise || ShimPromise;
export const r2 = new Promise(res => res(1));
export const r3 = Promise.try(fn);
globalThis.Map = ShimMap;
export const r4 = new Map();
// a ctor-slot write through ANY proxy pins the constructor's own entry up front, so
// core-js modules loading later in the bundle initialize from the pristine global - even
// when nothing in THIS file uses the constructor
window.WeakMap = window.WeakMap || ShimWeakMap;
Map.customExt = Map.customExt || customImpl;
export const r5 = Map.customExt(x);
// repeated mutations of one key all land on the same routed object, last write wins
Iterator.from ||= shimIterFrom;
Iterator.from = hardOverride;
export const r6 = Iterator.from(it);
