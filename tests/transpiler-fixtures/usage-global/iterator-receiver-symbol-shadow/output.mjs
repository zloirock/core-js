import "core-js/modules/es.array.push";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  const Symbol = {
    iterator: "slot"
  };
  return (effects.push("prefix"), Symbol.iterator) in {
    slot: 7
  };
}