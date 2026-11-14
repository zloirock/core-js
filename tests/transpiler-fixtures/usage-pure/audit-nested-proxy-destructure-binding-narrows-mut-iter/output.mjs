import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const {
  box: {
    Array: BoxArray
  }
} = _globalThis;
// A written proxy slot stays raw; its nested iterator dispatch reads the replacement once.
_globalThis.self = {
  Array: BoxArray
};
const mutIter = _getIteratorMethod(self.inner);
export { mutIter };