import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// an ALL-proxy ternary (both branches are global proxies, NO user object) with a side-effecting
// computed key: there is no divergent branch to corrupt, so the receiver collapses to a single proxy
// member and the polyfill is extracted unconditionally (polyfill always wins), the effect kept in the
// residual key. contrast the diverging case, which must mirror per branch to protect the user branch.
// `self` is fixture-only (absent in Node), but it collapses away here so the residual reads globalThis
const cond = false;
const from = _Array$from;
const {
  [(eff(), "from")]: _unused
} = _globalThis.Array;
typeof from;