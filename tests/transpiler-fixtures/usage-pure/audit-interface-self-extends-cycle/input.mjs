// transitive interface extends cycle: `A extends B; B extends A`. without a cycle guard
// in `appendInterfaceExtendsMembers` / `appendMergedInterfaceMembers`, the walker re-enters
// A's body through B's extends back-pointer indefinitely - eventual stack overflow or
// MAX_DEPTH bail (whichever fires first). `visited` Set propagated from `getTypeMembers`'s
// interface dispatch short-circuits the re-entry, falling back to A's already-collected
// own members. regression lock so future refactors don't drop the visited-set propagation
interface A extends B {
  a: number[];
}
interface B extends A {
  b: string[];
}
declare const x: A;
x.a.at(0);
