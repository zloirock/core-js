import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A live constructor residual keeps the receiver's store and prefix, once and in order.
// The stored value remains the realm rather than the constructor used by the residual.
let held;
const {
  missing
} = (held = (record(), _globalThis), _Map);
use(held, missing);