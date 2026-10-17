// A middle exported declarator keeps its two native array iterations.
// Instance bindings are exported while receiver captures remain private.
export const before = effect(), [[{ at, flat }]] = [[[1, [2]]]], after = effect();
