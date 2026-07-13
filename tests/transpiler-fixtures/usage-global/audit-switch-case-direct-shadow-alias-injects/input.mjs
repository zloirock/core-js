// an ALIAS of the proxy-global read at the DISCRIMINANT: the case-direct shadow of the alias
// name does not cover the discriminant, so the alias-follow must still resolve the outer const
// and inject the proxy-hop's own polyfill - dropping `web.self` here under-injects (the `.self`
// read lands on targets without it)
const g = globalThis;
let ya = {};
switch ((0, g.self).Array.prototype.findLastIndex) {
  case 1:
    let g = ya;
    break;
}
export { ya };
