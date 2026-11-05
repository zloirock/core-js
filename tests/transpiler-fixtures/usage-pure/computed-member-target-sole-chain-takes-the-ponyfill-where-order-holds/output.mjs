import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$values from "@core-js/pure/actual/object/values";
// Computed member targets take statics without moving target evaluation ahead of siblings.
// A sole chain extracts in place; a shared pattern mirrors its receiver and keeps target order.
// Nested instance targets remain native where an overwrite would re-read the receiver after the key.
let o;
e(), sink[k()] = _Array$from;
({
  Object: {
    [(e(), 'fromEntries')]: sink[k2()]
  }
} = {
  Object: {
    fromEntries: _Object$fromEntries
  }
});
({
  Map: {
    [(e(), 'groupBy')]: sink[k3()]
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
});
({
  y: {
    at: sink[k4()]
  }
} = {
  y: arr
});
({
  entries: sink[k5()],
  values: o
} = {
  entries: _Object$entries,
  values: _Object$values
});