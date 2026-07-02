// `x instanceof globalThis?.Map` - RHS is optional-chain proxy-global, identify Map
function check(x) { return x instanceof globalThis?.Map; }
check(new Map());
