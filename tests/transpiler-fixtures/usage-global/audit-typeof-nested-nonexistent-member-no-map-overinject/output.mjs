import "core-js/modules/es.global-this";
// `globalThis.Array.Map` is a nested access off the Array constructor - `Array.Map` does not exist, so
// the trailing `.Map` member must NOT be mistaken for the global `Map` and pull in the es.map.* set.
// Only the `globalThis` proxy-global itself is polyfilled here; a real `globalThis.Map` reference would
// instead inject the full Map polyfill set.
const t = typeof globalThis.Array.Map;