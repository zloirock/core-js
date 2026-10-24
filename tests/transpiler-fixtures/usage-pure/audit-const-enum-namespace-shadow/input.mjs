// a `namespace X {}` shadows the global X only when it is INSTANTIATED. a namespace whose sole member
// is a `const enum` (tsc-inlined, no runtime object) is elided, so X stays the global and its usage
// substitutes to the pure import; a regular `enum` instantiates the namespace and keeps the shadow,
// so that receiver stays raw. the two receivers below diverge on exactly this.
namespace Map { const enum E {} }
namespace Set { export enum R {} }
// @ts-expect-error the declaration emits nothing, so it types the read for tsc alone, and the runtime reads the global
export const viaMap = new Map([[1, 2]]);
// @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
export const viaSet = new Set([1]);
