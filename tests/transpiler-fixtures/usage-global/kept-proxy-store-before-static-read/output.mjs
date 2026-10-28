import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
// The retained store runs before the static read and keeps its prefix once.
let held;
export const {
  fromEntries: read
} = (held = (effect(), globalThis)).Object;
export { held };