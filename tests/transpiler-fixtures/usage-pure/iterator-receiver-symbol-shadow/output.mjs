import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const Symbol = {
    iterator: "slot"
  };
  return (_pushMaybeArray(effects).call(effects, "prefix"), Symbol.iterator) in {
    slot: 7
  };
}