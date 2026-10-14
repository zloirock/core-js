import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A static read by a bound computed key off a probed `window`: the bound key names the static, which loads
// its module beside the realm root's.
const K = 'of';
const {
  [K]: f
} = globalThis.window?.Array;
export { f };