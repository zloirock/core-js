// A defined realm element makes the IIFE's receiver default dead.
// The literal-array pattern retains its native constructor and static reads.
export const iifeRealm = (([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)])([globalThis]);
