import _descriptionMaybeSymbol from "@core-js/pure/actual/symbol/instance/description";
// A symbol property read needs the description getter on this target.
export function descriptionOf(value: symbol) {
  return _descriptionMaybeSymbol(value);
}