// a callee that IGNORES its parameter yields the same value for every argument, so the root proves
// like the no-param spelling; a callee that READS its parameter proves only what the ARGUMENT is
const ignores = x => globalThis;
export const paramIgnoringRoot = ignores(1)?.window?.Set.prototype.has.call(new Set([1]), 1);
