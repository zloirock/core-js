import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const {
  box: {
    Array: BoxArray
  }
} = _globalThis;
// NEGATIVE: a MUTATED proxy slot is the user's own replacement, so the leaf below it stays native
_globalThis.self = {
  Array: BoxArray
};
const {
  inner: {
    [_Symbol$iterator]: mutIter
  }
} = self;
export { mutIter };