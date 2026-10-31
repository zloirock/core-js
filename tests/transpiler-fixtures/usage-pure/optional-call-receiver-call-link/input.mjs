// the receiver's live `?.` can be an optional CALL: the callee's lookup takes the test and the call's
// result is read plainly by the method above it, so a result that comes out nullish throws there, as the
// source does. a method the build serves memoizes its lookup over the receiver - a tested receiver as a
// test of its own ahead of it - and one it does not keeps the plain member read
const box = globalThis.box;
export const servedLookup = box.list.flat?.().flatMap?.(x => [x]).at(0);
export const rawLookup = box.list.pick?.().toSorted?.().includes(1);
export const testedReceiver = box.list?.toReversed?.().findLast?.(Boolean).toFixed(1);
export const behindMemberLink = box?.list.toSpliced?.(0, 1).with?.(0, 1).keys();
