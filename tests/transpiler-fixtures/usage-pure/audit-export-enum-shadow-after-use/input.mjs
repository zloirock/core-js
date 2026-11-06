// `export enum Map { ... }` declared at module top level, but referenced before the
// declaration via `new Map()` inside a function. the export wrapper must not block the
// shadow detection, and lexical hoisting of the enum binding shadows the global Map for
// the whole module
function user() {
  // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
  const a = new Map();
  return a;
}
export enum Map { Foo, Bar }
export { user };
