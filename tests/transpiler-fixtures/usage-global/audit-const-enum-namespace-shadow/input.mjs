// a `namespace X {}` shadows the global X only when it is INSTANTIATED (emits a runtime object). a
// namespace whose members are all tsc-elided (a `const enum` is inlined, an interface / type alias
// erases) emits nothing, so X stays the global and its usage must be polyfilled. a regular `enum`
// DOES instantiate the namespace, keeping the shadow. instantiation recurses: a namespace whose only
// member is another namespace is instantiated iff that inner one is - so a const-enum-only inner keeps
// the outer elided too. the three receivers below diverge on exactly this.
namespace Map { const enum E {} }
namespace Set { export enum R {} }
namespace Array { namespace Inner { const enum E {} } }
// @ts-expect-error the declaration emits nothing, so it types the read for tsc alone, and the runtime reads the global
new Map([[1, 2]]);
// @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
new Set([1]);
// @ts-expect-error the declaration emits nothing, so it types the read for tsc alone, and the runtime reads the global
Array.from([1]);
export {};
