import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
// The selecting realm's effects run once before its guarded static lookup.
export function read(choice, custom, effect) {
  return ((effect(), choice) ? globalThis : custom)?.Object.fromEntries([["x", 3]]);
}