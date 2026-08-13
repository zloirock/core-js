import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// a BARE static read (no claim tail above it) through a chain-assignment whose value carries a
// side-effecting sequence: the value classifies through the sequence like the SE-free spelling,
// so the read claims its ponyfill instead of staying a raw native read. the assignment is kept
// whole and the effect runs exactly once, ahead of the claimed static. one family per row: a
// sequence WRAPPING the navigation, and a navigation ROOTED at the sequence
let q;
const arr = [1];
export const viaSeqWrapped = (q = (_Promise$resolve(1), _self), _Map);
export const viaSeqRooted = (q = (_atMaybeArray(arr).call(arr, 0), _self), _Set);