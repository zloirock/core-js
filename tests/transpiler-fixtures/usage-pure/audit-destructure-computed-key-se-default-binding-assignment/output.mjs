import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// a defaulted binding (`m = []`, an AssignmentPattern) in an assignment-context SE-key: the binding
// Identifier is unwrapped so the post-statement overwrite targets `m`, not the AssignmentPattern
let m;
({
  [(eff(), 'flat')]: m = []
} = arr);
m = (_ref = _flatMaybeArray(arr)) === void 0 ? m : _ref;