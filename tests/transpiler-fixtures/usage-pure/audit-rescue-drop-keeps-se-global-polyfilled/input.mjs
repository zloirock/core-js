// dropping a multi-hop proxy rescue receiver must: (a) NOT orphan an inner global when the proxy chain
// sits ABOVE an SE sequence (`((se, globalThis).self).Array`) - the whole receiver is skipped, so a
// kept `globalThis` rewrite cannot race the drop; (b) still POLYFILL a global buried in the KEPT side
// effect (`Array.from(...)`), not skip it away with the dropped receiver value. covers the param-default
// and per-branch synth-swap drop paths. distinct methods so each injected import is unambiguous
let pushes = 0;
const log = [];
function withParamDefault({ of } = ((pushes++, globalThis).self).Array) {
  return of;
}
const { from } = pushes ? Array : ((log.push(Array.from([1])), globalThis.self).Array);
export { withParamDefault, from };
