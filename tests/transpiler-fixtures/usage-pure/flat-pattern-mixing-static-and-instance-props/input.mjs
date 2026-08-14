// a flat pattern holding both a plan-consumable static and a prop the plan keeps verbatim: the
// shared-plan route would strand the second one native, so a pattern with any unconsumed prop
// stays on the per-prop path, which emits the two kinds side by side
const src = Array;
const { of, name } = src;
const { groupBy, name: mapName } = Map;
const { of: setOf, from: setFrom } = Set;
console.log(of, name, groupBy, mapName, setOf, setFrom);
