import "core-js/modules/es.symbol.description";
// A symbol property read needs the description getter on this target.
export function descriptionOf(value: symbol) {
  return value.description;
}