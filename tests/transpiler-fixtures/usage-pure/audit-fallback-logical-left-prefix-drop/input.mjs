// The marker may be a getter. Keep its read and the polyfilled call in the other prefix
// before substituting the selected Array method. The right fallback is unreachable.
const log = [];
function pureLeftPrefix({ of } = (globalThis.marker, globalThis.Array) || Set) {
  return of;
}
function seLeftPrefix({ from } = (log.push(Object.fromEntries([])), globalThis).Array || Set) {
  return from;
}
export { pureLeftPrefix, seLeftPrefix };
