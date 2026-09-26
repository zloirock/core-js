import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// An anchored sibling may split the declaration while a computed-key extraction captures
// its receiver before the key effect. The target remains in TDZ until its binding completes.
const {
  custom
} = _Map;
const _ref = arr;
const a = null == _ref ? _ref[""] : (eff(), _at(_ref));
console.log(custom, a);