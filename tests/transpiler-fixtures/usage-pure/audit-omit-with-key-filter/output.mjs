import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Omit<T, K> - STRUCTURE_PRESERVING_WRAPPERS includes Omit. But Omit is supposed to REMOVE keys.
// The current pass-through ignores K. per "Pick/Omit pass-through without key-filtering" - accepted precision limit.
// This fixture documents that behaviour: Omit<{a: number[], b: string[]}, 'a'>.a still resolves to number[]
// (even though TS would say `.a` doesn't exist on Omit<..., 'a'>).
type T = {
  a: number[];
  b: string[];
};
type Without = Omit<T, 'a'>;
declare const w: Without;
_atMaybeArray(_ref = w.b).call(_ref, 0);