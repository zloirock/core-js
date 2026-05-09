// user-written `_ref` at outer scope - emitted polyfill refs must skip past it to a
// numbered slot rather than rename user's binding/references
let _ref = "user-value";
const a = [1, 2, 3].at(-1);
const b = [4, 5, 6].at(-1);
export { _ref, a, b };
