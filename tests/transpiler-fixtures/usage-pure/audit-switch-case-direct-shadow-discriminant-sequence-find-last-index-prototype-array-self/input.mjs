// An ALIAS of the proxy-global buried in a sequence tail: the case-direct shadow of the alias name must not stop the alias-follow
// at the discriminant - the redundant proxy hop still collapses (a kept `.self` hop reads undefined off-engine).
const g = globalThis;
let ya = {};
switch ((0, g.self).Array.prototype.findLastIndex) {
  case 1:
    let g = ya;
    break;
}
export { ya };
