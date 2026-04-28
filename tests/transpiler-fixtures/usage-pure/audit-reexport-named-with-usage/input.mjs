// re-export of `Map` from a core-js pure path under an aliased name; user usage of
// `new Map()` doesn't see the re-exported binding (re-export creates a foreign-export
// edge, not a local scope binding). plugin emits its own `_Map` default import for
// the constructor call - the re-export passes through unchanged
export { default as Map } from 'core-js/pure/actual/map/constructor';
const m = new Map();
m.has(1);
