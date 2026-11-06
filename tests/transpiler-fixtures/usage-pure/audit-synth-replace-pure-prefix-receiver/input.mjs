// The pure-read sequence prefix performs no work and is dropped when its receiver is replaced. The
// local truthy selector also decides the Array arm. `pure-read-prefix-stays-branch-local` keeps the
// prefixed receiver on a live branch under an undecided condition.
function withParamDefault({ of } = (globalThis.marker, globalThis.self).Array) {
  return of;
}
let cond = 1;
const { from } = cond ? Array : ((globalThis.marker, globalThis.self).Array);
export { withParamDefault, from };
