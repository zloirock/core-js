// a synth-swap receiver carrying a PURE-read sequence prefix and NO real side effect
// (`(globalThis.marker, globalThis.self).Array`) is fully REPLACED by the synth literal - the prefix is
// dropped (it observes nothing), not kept. the receiver must be skip-marked WHOLE: a spine-only skip
// stops at the sequence and leaves the prefix's `globalThis` to rewrite into the now-dead span, which
// orphans the rewrite and aborts the transform. covers the param-default and per-branch synth-swap paths
function withParamDefault({ of } = (globalThis.marker, globalThis.self).Array) {
  return of;
}
let cond = 1;
const { from } = cond ? Array : ((globalThis.marker, globalThis.self).Array);
export { withParamDefault, from };
