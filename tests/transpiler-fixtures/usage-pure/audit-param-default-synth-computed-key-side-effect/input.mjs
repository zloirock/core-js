// A computed constructor leaf keeps its effect channel during parameter synthesis.
// An effectful realm-hop key keeps the original parameter receiver instead.
let spineKeyReads = 0;
let ownKeyReads = 0;
function withOf({ of } = globalThis[(spineKeyReads++, 'self')].Array) {
  return of;
}
function withFrom({ from } = globalThis[(ownKeyReads++, 'Array')]) {
  return from;
}
export { withOf, withFrom };
