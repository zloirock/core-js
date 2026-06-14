import _at from "@core-js/pure/actual/instance/at";
// a destructuring write to a discriminant-narrowed member path (`[w.meta] = src`) rebinds
// the narrowed object without a bare assignment LHS, so it must invalidate the narrow just like a
// plain `w.meta = src` does -> generic `_at` instead of the branch-specific array Maybe
type Wrap = {
  meta: {
    kind: "a";
    data: string[];
  } | {
    kind: "b";
    data: number;
  };
};
function f(w: Wrap, src: any) {
  if (w.meta.kind === "a") {
    var _ref;
    [w.meta] = src;
    return _at(_ref = w.meta.data).call(_ref, 0);
  }
}