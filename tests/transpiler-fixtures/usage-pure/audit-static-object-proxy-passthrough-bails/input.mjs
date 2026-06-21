// a static-object receiver whose descent reaches a proxy (`{ g: globalThis }`) carrying a PASSTHROUGH
// leaf (`Set` shorthand - a missing-able ctor read off the receiver): the mirror cannot NAME the static-
// object receiver to render the passthrough (it would emit a null-named member), so it bails to the
// native receiver instead of crashing. an all-polyfill static-object subtree (no passthrough) still
// mirrors - this fixture guards the regression where the bail was missing and the babel emitter threw
const w = { g: globalThis };
function read({ g: { Set } } = w) {
  return new Set();
}
export const out = read();
