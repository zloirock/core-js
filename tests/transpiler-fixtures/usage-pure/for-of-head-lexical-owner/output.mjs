import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// The lexical loop binding shadows the outer binding only inside the loop.
// Its Map escapes; the outer Set stays local and needs only its constructor in pure.
function expose() {
  let value = _Set;
  for (let [value] of [[_Map]]) hand(value);
  void _nameMaybeFunction(value);
}