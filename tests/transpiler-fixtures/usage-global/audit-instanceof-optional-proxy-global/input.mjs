// `x instanceof globalThis?.Map` - RHS is optional-chain proxy-global, identify Map
export function check(x) { return x instanceof globalThis?.Map; }
