import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// an array-wrap alias (`const [{ Array: A }] = [globalThis]`) resolves to the global constructor
// for RETURN-TYPE inference too, so a static call off it (`A.of(...)`) is known to return an Array
// and the chained instance method resolves array-specific - matching the plain-destructure form
const [{
  Array: A
}] = [_globalThis];
const built = _Array$of(1, 2, 3);
export const viaArrayWrap = _atMaybeArray(built).call(built, -1);

// a DEEP array-wrap resolves positionally through every layer
const [[{
  Array: D
}]] = [[_globalThis]];
const deep = _Array$of(4, 5, 6);
export const viaDeepWrap = _atMaybeArray(deep).call(deep, -1);

// an array-wrap off a USER object stays generic: A reads `userObj.Array`, not the global
const userObj = {
  Array: class {}
};
const [{
  Array: U
}] = [userObj];
const user = U.of(7);
export const viaUserObject = _at(user).call(user, -1);