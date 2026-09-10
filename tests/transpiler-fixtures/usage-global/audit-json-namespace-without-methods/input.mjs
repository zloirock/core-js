// a VALUE-only usage of a namespace: `globalThis.JSON` read for truthiness names the root and
// injects `es.global-this` alone, while the bare `JSON` value carries no member to narrow on and
// pulls the whole namespace family, `@@toStringTag` included
export const supported = globalThis.JSON ? 'yes' : 'no';
export const escaped = JSON;
