// on a target where `self` is native but `globalThis` is not, only PART of the nav is ponyfillable:
// the guard must not render a collapse for a hop the resolver refuses, and the hops it does own
// still resolve. every fixture around this one pins `ie: 11`, where everything is polyfilled at once
globalThis.modernBox = { list: ['ab', 'cd'], n: 4 };
let k = 0;
export const plainDispatch = globalThis.window?.self.modernBox.list?.at(0);
export const layeredDispatch = (globalThis.window?.self.modernBox).list?.at(0);
export const sequenceDispatch = ('x', globalThis.window?.self.modernBox.list)?.at(0);
export const staticClaim = globalThis.window?.self.Array.of(1).at(0);
export const keyEffect = globalThis.window?.self.modernBox.list[(k++, 'at')](0);
export const plainValue = globalThis.window?.self.modernBox.n;
export { k };
