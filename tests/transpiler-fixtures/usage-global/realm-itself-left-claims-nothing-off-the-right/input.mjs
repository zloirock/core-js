// The realm itself on the left of `||` / `??` - a global this build serves - decides the selection: a
// static only the right's constructor owns stays a read off the realm, in a declaration and in an
// assignment alike, and the right never runs, so it injects nothing (no `Array.from` / `Array.of` /
// `Object.fromEntries` module).
const { from } = globalThis || Array;
const { fromEntries } = self ?? Object;
let of;
({ of } = globalThis || Array);
export { from, fromEntries, of };
