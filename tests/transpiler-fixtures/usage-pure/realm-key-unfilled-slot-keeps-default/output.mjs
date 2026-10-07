import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A key read off the realm whose global core-js implements nothing of (`Float16Array`, whose definition
// lists methods alone; `BigInt`) names a slot a target may leave empty: an engine lacking it runs the level's
// default, which keeps its own mirror, through a realm hop too. A global core-js implements fills its slot
// everywhere, so its default is dead (`Map`) - unless this file writes the slot, which may then hold anything,
// the default live again (`WeakSet`).
const {
  Float16Array: {
    from
  } = {
    from: _Array$from
  }
} = _globalThis;
const {
  BigInt: {
    asUintN
  } = shimBigInt
} = _globalThis;
const {
  Float16Array: {
    of
  } = {
    of: _Array$of
  }
} = _globalThis;
const {
  Map: {
    groupBy
  } = Object
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
_globalThis.WeakSet = maybeWeakSet;
const {
  WeakSet: {
    fromEntries
  } = {
    fromEntries: _Object$fromEntries
  }
} = _globalThis;
export { from, asUintN, of, groupBy, fromEntries };