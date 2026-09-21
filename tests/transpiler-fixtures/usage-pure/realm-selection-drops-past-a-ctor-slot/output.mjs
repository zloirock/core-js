import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// A selection whose arms all yield the realm serves constructor and static slots together.
// A user-object fallback keeps its own branch and members.
const {
  self: {
    Map: {
      groupBy: grouped
    },
    Set: SetCtor
  }
} = {
  self: {
    Map: {
      groupBy: _Map$groupBy
    },
    Set: _Set
  }
};
const {
  Map: {
    groupBy: flatGrouped
  },
  Set: FlatSet
} = {
  Map: {
    groupBy: _Map$groupBy
  },
  Set: _Set
};
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