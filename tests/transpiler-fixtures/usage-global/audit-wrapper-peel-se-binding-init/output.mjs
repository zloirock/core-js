import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A variable bound to a side-effect-prefixed sequence holds the sequence tail at runtime, and the
// binding declaration stays verbatim (only USES are import-injected), so the binding resolves to its
// tail global - here `globalThis` - and the member call injects its polyfill. A side-effect-bailing
// peel left the binding unresolved and dropped the injection.
const g = (globalThis.sideEffect(), globalThis);
g.Array.from([1]);