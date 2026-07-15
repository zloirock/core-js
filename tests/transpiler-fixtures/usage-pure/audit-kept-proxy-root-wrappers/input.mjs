// runtime-transparent WRAPPERS between a kept proxy root and its navigation. they carry no runtime meaning,
// so each shape must come out exactly like its bare twin: the assignment stays as the root, the redundant
// proxy hop drops, the guard survives. the climb that finds the collapse target has to peel to the same
// depth its anchor sits at - a chain-assign anchor IS an assignment, so a descent that peels through
// assignments walks past it and the climb dies on the first wrapper, leaving the hop raw.
// a cast around the root, a non-null assertion, plain parens, and a wrapper mid-chain. distinct methods.
let a;
export const throughCast = ((a = globalThis.window) as any)?.self.Array.prototype.flat.call([1, [2]]);

let b;
export const throughNonNull = (b = globalThis.window)!?.self.Array.prototype.at.call([1], 0);

let c;
export const throughParens = ((c = globalThis.window))?.self.Array.prototype.includes.call([1], 1);

let d;
export const wrapperMidChain = ((d = globalThis.window)?.self as any).Array.prototype.findLast.call([1], x => x);
