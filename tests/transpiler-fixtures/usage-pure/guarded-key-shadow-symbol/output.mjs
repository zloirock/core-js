import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Guarded keys and their receivers retain value, reference and effect semantics.
export function read(choice) {
  const effects = [];
  const Symbol = {
    iterator: "slot"
  };
  const list = {
    slot: 17
  };
  return list[(_pushMaybeArray(effects).call(effects, 1), _pushMaybeArray(effects).call(effects, 2), Symbol).iterator];
}