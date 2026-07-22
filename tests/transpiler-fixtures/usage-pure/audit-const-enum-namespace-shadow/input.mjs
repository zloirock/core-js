// a `namespace X {}` shadows the global X only when it is INSTANTIATED. a namespace whose sole member
// is a `const enum` (tsc-inlined, no runtime object) is elided, so X stays the global and its usage
// substitutes to the pure import; a regular `enum` instantiates the namespace and keeps the shadow,
// so that receiver stays raw. the two receivers below diverge on exactly this.
namespace Map { const enum E {} }
namespace Set { export enum R {} }
export const viaMap = new Map([[1, 2]]);
export const viaSet = new Set([1]);
