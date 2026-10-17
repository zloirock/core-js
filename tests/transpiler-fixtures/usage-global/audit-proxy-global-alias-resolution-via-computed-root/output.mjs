import "core-js/modules/es.object.entries";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a constant COMPUTED key in the proxy-global destructure root folds like the literal spelling
const KEY = 'self';
const {
  [KEY]: sc
} = globalThis;
export const viaComputedRoot = sc.Object.entries({
  a: 1
});