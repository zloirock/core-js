import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a wrapper alias's WRAPPED spellings hand the same runtime value as the bare one, so the
// follow judges the EFFECTIVE value: a paren around the slot element, a paren around the init
// and a sequence tail all extract like the bare spelling. the NEGATIVE pins the boundary: a
// spread hidden by the wrapper still makes the union incomplete, and the follow declines whole
const [parenElement] = [[_globalThis]];
export const viaParenElement = _Object$fromEntries;
const [parenInit] = [[_globalThis]];
export const viaParenInit = _Object$groupBy;
let seq = 0;
const [seqInit] = (seq++, [[_globalThis]]);
export const viaSeqInit = _Array$from;
const xs = [];
const [spreadUnderParen] = [...xs, [_globalThis]];
export const [{
  Object: {
    assign: staysNative
  }
}] = spreadUnderParen;
export const results = [viaParenElement([["k", 1]]), viaParenInit([2], x => x), viaSeqInit([3]), staysNative({}, {
  a: 4
})];