// `unknownFn(o)` passes `o` to a user-defined function not in known-built-in-return-types.
// resolveKnownStaticEntry returns null and the call site classifies as 'leak'. negative-by-
// design: this is the conservative default that the mutatesArgument allowlist relaxes for
// known built-ins. unknown functions could mutate `o.arr` to any type, so narrowing must be
// abandoned. without this fallback, every external call would silently preserve narrows and
// crash at runtime when the function actually mutates
const o = {
  arr: [1, 2, 3],
  test() {
    unknownFn(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
function unknownFn(p) { p.arr = "stringified"; }
o.test();
