import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Each field evaluation owns the receiver captured before the computed key.
// Re-entry cannot replace the outer invocation's receiver.
export function read(get, key, argument) {
  return new class {
    value = get()[key(), 'at'](argument());
  }().value;
}