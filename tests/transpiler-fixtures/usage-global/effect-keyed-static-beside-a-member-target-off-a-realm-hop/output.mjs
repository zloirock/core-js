import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A static keyed by an effect between a member target and a plain slot, assigned off a probed `window` and
// off the realm: each folded key loads its static.
let f4, c4, f6, c6;
const o = {};
({
  Array: {
    isArray: o.g,
    [(e(), "fromAsync")]: f4,
    custom: c4
  }
} = globalThis.window);
({
  Array: {
    isArray: o.h,
    [(e(), 'of')]: f6,
    custom: c6
  }
} = globalThis);