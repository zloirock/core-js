import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A selection every branch of which yields the REALM drops whole, so the plain CONSTRUCTOR slot and
// the hop's leaf beside it both bind their own ponyfill with no literal between them, under a
// shared proxy step and flat off the root alike. A fallback that is a user object is the negative:
// there the branch still decides, so the mirror stands and the slot rides its literal.
const grouped = _Map$groupBy;
const SetCtor = _Set;
const flatGrouped = _Map$groupBy;
const FlatSet = _Set;
const box = {
  Map: _Map,
  Set: _Set
};
const {
  Map: {
    groupBy: keptGrouped
  },
  Set: KeptSet
} = null == _globalThis.window ? box : {
  Map: {
    groupBy: _Map$groupBy
  },
  Set: _Set
};
export { grouped, SetCtor, flatGrouped, FlatSet, keptGrouped, KeptSet };