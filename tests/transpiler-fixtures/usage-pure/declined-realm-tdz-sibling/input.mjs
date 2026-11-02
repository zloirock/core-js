// An unknown child key stays in its TDZ, after the realm root becomes available.
// A later native sibling must not read ahead of that key.
const { globalThis: { [key]: { prototype } }, key, tail } = globalThis;
