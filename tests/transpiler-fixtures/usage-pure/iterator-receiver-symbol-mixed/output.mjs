import _Symbol from "@core-js/pure/actual/symbol";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const S = {
    iterator: "slot"
  };
  return (choice ? _Symbol : S).iterator in [3];
}