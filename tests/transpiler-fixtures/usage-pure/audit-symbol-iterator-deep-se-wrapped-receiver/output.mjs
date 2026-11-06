import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Iterator receivers preserve quiet navigation and root prefixes. Effectful realm keys keep their source read and independent symbol claim.
let c = 0;
const seWrapped = _getIteratorMethod((c++, _self).Array.prototype);
const computedKey = _getIteratorMethod(_globalThis[c++, 'self'].Array.prototype);
const plainDeep = _getIteratorMethod(_self.Array.prototype);
const real = _getIteratorMethod([1]);
export { seWrapped, computedKey, plainDeep, real, c };