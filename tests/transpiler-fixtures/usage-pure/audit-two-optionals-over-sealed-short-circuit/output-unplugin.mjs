import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// TWO live `?.` over a SEALED short-circuiting value: both take their undefinedness from the same
// probe below the seal, so ONE test expresses them. counted as two sources the claim STOOD DOWN and
// shipped a native static - the one answer usage-pure may never give. the seal does not CREATE
// undefinedness (it only makes the read above it observable), so a sealed source keys by the source
// its own value has, which is what the unsealed spelling keys by too.
export const twoOptionalsSealed = (null == _globalThis.window ? void 0 : _Array$of(5));
export const twoOptionalsSealedMember = (null == _globalThis.window ? void 0 : _Promise$resolve);
export const threeOptionalsSealed = ((null == _globalThis.window ? void 0 : _Array$of)?.(6));
// NEGATIVE: the same two optionals with NO seal - the locked single-test shape
export const twoOptionalsBare = null == _globalThis.window ? void 0 : _Array$of(7);
// NEGATIVE: one optional over the sealed value - one source either way
export const oneOptionalSealed = (null == _globalThis.window ? void 0 : _Array$of(8));