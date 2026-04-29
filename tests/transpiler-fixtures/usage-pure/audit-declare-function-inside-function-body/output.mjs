import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `declare function` inside function body: ambient binding в nested scope. ambient walk
// должен drill через function-body BlockStatement до statement array. Без этого `g().at(0)`
// fall'ит к generic вместо array-narrowed (return type number[] аннотация теряется)
function f() {
  var _ref;
  declare function g(): number[];
  return _atMaybeArray(_ref = g()).call(_ref, 0);
}