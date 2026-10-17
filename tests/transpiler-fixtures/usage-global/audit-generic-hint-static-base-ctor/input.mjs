// a bare constructor read resolved through a GENERIC hint (`.name` -> es.function.name) injects
// nothing that guarantees the RECEIVER global itself - the base constructor must come alongside,
// else the read throws off-engine before the generic polyfill matters. isolates the
// base-constructor direction: proxy-hop fixtures reach the ctor via the hop's own value meta and
// would pass without it
export const n = Promise.name;
export const l = Map.length;
