// transitive interface extends cycle: `A extends B; B extends A`. without a cycle guard the
// member walker re-enters A's body through B's extends back-pointer indefinitely - eventual
// stack overflow or MAX_DEPTH bail. a visited set propagated through the interface dispatch
// short-circuits the re-entry, falling back to A's already-collected own members so `.at`
// still resolves; regression lock so future refactors keep the visited-set propagation
interface A extends B {
  a: number[];
}
interface B extends A {
  b: string[];
}
declare const x: A;
x.a.at(0);
