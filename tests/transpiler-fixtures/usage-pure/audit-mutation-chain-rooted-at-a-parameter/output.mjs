import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
// a write whose chain is ROOTED at a parameter resolves through the same pairing the bare
// parameter does - the second value-resolution entry point owes the same answer as the first, and
// an unreadable hop off the root is where only it can answer: the mutation could sit anywhere
// under that root, so the constructor the call passes deopts whole. the control keeps its
// substitution, which is what says the deopt came from the pairing and not from the file
function viaUnreadableHop(target) {
  target[key].groupBy = patch;
}
viaUnreadableHop(_Map);
_Map.groupBy(src, it => it);
function neverCalled(target) {
  target[key].from = patch;
}
_Array$from(src);