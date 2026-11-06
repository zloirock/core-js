import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// An anchored sibling may split the declaration while a computed-key extraction captures
// its receiver before the key effect. The target remains in TDZ until its binding completes.
const {
  custom
} = _Map;
const a = null == arr ? arr[""] : (eff(), _at(arr));
console.log(custom, a);