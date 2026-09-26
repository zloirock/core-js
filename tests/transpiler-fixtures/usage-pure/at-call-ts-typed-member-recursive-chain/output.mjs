import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type Tree = {
  children: Tree[];
  label: string;
};
declare const t: Tree;
_atMaybeArray(_ref = t.children).call(_ref, 0);