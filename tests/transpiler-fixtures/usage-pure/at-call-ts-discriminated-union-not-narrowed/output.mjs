import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Foo = {
  kind: "a";
  data: string[];
} | {
  kind: "b";
  data: number;
};
function f(x: Foo) {
  if (x.kind === "a") {
    var _ref;
    _atMaybeArray(_ref = x.data).call(_ref, 0);
  }
}