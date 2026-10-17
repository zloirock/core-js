// a TS cast around the kept root COMBINED with a SE-bearing hop key: the wrapper peels away and the
// key migrates exactly like the unwrapped twin
let e = 0;
export { e };
// A TS cast around the kept root COMBINED with the double-optional chain: the wrappers peel on the
// way down, the memo still anchors at the root guard and both dead hops drop.
let dw;
export const castDoubleOptional = ((dw = globalThis.window) as any)?.self?.[(e++, 'self')].Array.prototype.findIndex.call([1], v => v === 1);
