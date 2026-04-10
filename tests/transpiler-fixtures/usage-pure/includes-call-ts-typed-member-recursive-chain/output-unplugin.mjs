var _ref, _ref2;
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Tree = { children: Tree[]; label: string };
declare const t: Tree;
_includesMaybeArray(_ref = t.children).call(_ref, t);
_atMaybeString(_ref2 = t.label).call(_ref2, -1);