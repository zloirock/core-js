import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a sequence buried at a proven call root rides INSIDE the guard test, spelled exactly once: the
// delete flavor hands the guard the whole operator, the read flavor folds the tail into the
// alternate, and a claim inside the prefix stays live where it stands. an IDENT root under the same
// prefix renders the same guard: the hops above the prefix are the guard's, `self` its pure entry.
let seqE = 0;
const arr = [1, 2, 3];
const utRoot = () => _globalThis;
export const deletedSeqPrefixCallRoot = null == (seqE++, utRoot()).window ? true : delete _self?.customQ;
export const readSeqPrefixCallRoot = null == (seqE++, utRoot()).window ? void 0 : _self.customQ;
export const claimInSeqPrefix = null == (_atMaybeArray(arr).call(arr, 0), utRoot()).window ? true : delete _self?.customQ;
export const deletedSeqPrefixIdentRoot = null == (seqE++, _globalThis).window ? true : delete _self?.customQ;
export { seqE };