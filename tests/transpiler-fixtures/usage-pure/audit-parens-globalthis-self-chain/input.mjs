// parens between intermediate proxy-global links - chain still resolves to Array.from
const r = (globalThis.self).Array.from([1, 2, 3]);
globalThis.__r = r;
