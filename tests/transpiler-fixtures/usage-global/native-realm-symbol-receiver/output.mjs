import "core-js/modules/web.self";
// A native root leaves a backed receiver hop to its own claim.
export const r = globalThis.self[Symbol.iterator];