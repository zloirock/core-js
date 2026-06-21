// a fallback-logical synth-swap receiver (`LEFT || Set`) collapses to the synth literal: LEFT's resolved
// TAIL is replaced and the dead RIGHT operand dropped. the WHOLE left operand is skip-marked - a tail-only
// skip leaves a sequence prefix's DROPPED globals (`(globalThis.marker, globalThis.Array)`) visible to
// leak a dead `_globalThis` import; only the harvested SE is re-exposed so its own globals still polyfill.
// covers a PURE prefix (dropped whole) and a polyfillable-SE prefix (kept ahead of the literal)
const log = [];
function pureLeftPrefix({ of } = (globalThis.marker, globalThis.Array) || Set) {
  return of;
}
function seLeftPrefix({ from } = (log.push(Object.fromEntries([])), globalThis).Array || Set) {
  return from;
}
export { pureLeftPrefix, seLeftPrefix };
