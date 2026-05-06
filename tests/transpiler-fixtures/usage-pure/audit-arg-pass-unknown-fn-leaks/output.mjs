import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// `unknownFn(o)` passes `o` to a user-defined function not in known-built-in-return-types.
// resolveKnownStaticEntry returns null and the call site classifies as 'leak'. negative-by-
// design: this is the conservative default that the mutatesArgument allowlist relaxes for
// known built-ins. unknown functions could mutate `o.arr` to any type, so narrowing must be
// abandoned. without this fallback, every external call would silently preserve narrows and
// crash at runtime when the function actually mutates
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref, _ref2;
    unknownFn(o);
    const a = _at(_ref = this.arr).call(_ref, 0);
    const b = _includes(_ref2 = this.arr).call(_ref2, 0);
    return [a, b];
  }
};
function unknownFn(p) {
  p.arr = "stringified";
}
o.test();