import _at from "@core-js/pure/actual/instance/at";
// loop back-edge: a discriminant guard narrows `w` to the array-bearing branch BEFORE the loop, but
// the loop tail reassigns `w` to the other branch, so the next iteration's `w.data.at()` may run on a
// string. the guard sits outside the loop and cannot re-narrow per iteration - degrade to generic.
declare let w: {
  tag: "a";
  data: number[];
} | {
  tag: "b";
  data: string;
};
declare let other: typeof w;
declare function cond(): boolean;
if (w.tag === "a") {
  while (cond()) {
    var _ref;
    _at(_ref = w.data).call(_ref, -1);
    w = other;
  }
}