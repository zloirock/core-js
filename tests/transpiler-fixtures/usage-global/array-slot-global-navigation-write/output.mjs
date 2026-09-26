import "core-js/modules/es.global-this";
// A fresh object replaces the array slot before its method is read.
// Only globalThis needs a polyfill; the replacement's own from is called unchanged.
const slot = [globalThis.Array];
slot[0] = {
  from: value => value
};
export const replaced = slot[0].from([1]);