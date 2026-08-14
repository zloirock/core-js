import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a flat pattern holding both a plan-consumable static and a prop the plan keeps verbatim: the
// shared-plan route would strand the second one native, so a pattern with any unconsumed prop
// stays on the per-prop path, which emits the two kinds side by side
const src = Array;
const of = _Array$of;
const name = _nameMaybeFunction(src);
const groupBy = _Map$groupBy;
const mapName = _nameMaybeFunction(_Map);
const {
  of: setOf,
  from: setFrom
} = _Set;
console.log(of, name, groupBy, mapName, setOf, setFrom);