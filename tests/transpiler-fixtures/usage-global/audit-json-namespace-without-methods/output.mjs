import "core-js/modules/es.global-this";
// a VALUE-only usage of a namespace: `globalThis.JSON` read for truthiness names the root and
// injects `es.global-this` alone, and the bare `JSON` value escaping through an export pulls none of
// the namespace's modules, `@@toStringTag` included: core-js defines no module for `JSON` itself
export const supported = globalThis.JSON ? 'yes' : 'no';
export const escaped = JSON;