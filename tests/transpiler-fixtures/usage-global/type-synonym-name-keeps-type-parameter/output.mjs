import "core-js/modules/es.string.at";
// A constrained type parameter outranks a built-in synonym.
// The source constraint keeps String instance dispatch precise.
export function read<IteratorObject extends string>(value: IteratorObject) {
  return value.at(0);
}