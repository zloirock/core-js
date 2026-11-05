import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// Computed member targets and their siblings retain source order in a receiver mirror.
// Native sibling reads use getters at their pattern slots, between target evaluations and writes.
let v;
const o = {};
({
  values: o.v,
  entries: sink[k()]
} = {
  values: _Object$values,
  entries: _Object$entries
});
({
  fromEntries: v,
  groupBy: sink[k2()]
} = {
  fromEntries: _Object$fromEntries,
  groupBy: _Object$groupBy
});
({
  of: o.of,
  from: o.fr,
  fromAsync: sink[k3()]
} = {
  of: _Array$of,
  from: _Array$from,
  fromAsync: _Array$fromAsync
});
({
  custom: o.c,
  keys: sink[k4()]
} = (_ref => {
  return {
    get custom() {
      return _ref.custom;
    },
    keys: _Object$keys
  };
})(Object));