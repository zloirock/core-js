import _Promise from "@core-js/pure/actual/promise";
// a capture of the global an undecidable guard reads decides the install as much as a read in its test,
// so it stays the user's; a capture the guard does not read still takes the pure import
var NativePromise = window.Promise;
var early = _Promise;
if (!NativePromise || NativePromise.length !== 1) window.Promise = PromiseShim;
export const ready = [early, Promise.resolve(1)];