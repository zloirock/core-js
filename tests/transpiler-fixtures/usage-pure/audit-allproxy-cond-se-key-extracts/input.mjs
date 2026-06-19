// an ALL-proxy ternary (both branches are global proxies, NO user object) with a side-effecting
// computed key: there is no divergent branch to corrupt, so the receiver collapses to a single proxy
// member and the polyfill is extracted unconditionally (polyfill always wins), the effect kept in the
// residual key. contrast the diverging case, which must mirror per branch to protect the user branch.
// `self` is fixture-only (absent in Node), but it collapses away here so the residual reads globalThis
const cond = false;
const { Array: { [(eff(), "from")]: from } } = cond ? globalThis : self;
typeof from;
