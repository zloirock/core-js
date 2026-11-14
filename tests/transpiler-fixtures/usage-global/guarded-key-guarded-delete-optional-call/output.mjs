import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  const effects = [];
  return delete (choice ? Object : null).fromEntries?.([]);
}