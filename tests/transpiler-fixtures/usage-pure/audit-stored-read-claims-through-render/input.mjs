// a READ target with a claiming read: the write collapses AND the read still resolves the
// static through the stored conditional, typed dispatch included
let k9;
k9 = globalThis.window?.self.window;
export const viaStoredReadClaim = k9?.Array.of(3).at(0);

// reads of the stored target claim through the RENDERED conditional in every guard form -
// and, because the render IS the navigation it replaced, in unguarded forms too (a braced
// `if` body, a later function body) exactly like the raw source classifies them
let k13;
k13 = globalThis.window?.self.window;
export let viaBracedIfRead;
if (k13) {
  viaBracedIfRead = k13.Array.from('ab');
}
export function viaFunctionBodyRead() {
  return k13.Object.entries({});
}
