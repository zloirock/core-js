// an install under a presence test the build decides never runs in its own function either, wherever and
// however often the function is called, so every read of the slot takes the pure import
function polyfill() {
  if (typeof Promise == 'undefined') globalThis.Promise = PromiseShim;
}
polyfill();
export const settled = Promise.allSettled([]);
