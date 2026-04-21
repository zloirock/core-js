import _Array$from from "@core-js/pure/actual/array/from";
import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
// destructure init is LogicalExpression - buildDestructuringInitMeta special-cases `?? || &&`.
// `?? || `: primary is left, fallback is right. `&&`: primary is right (always conditional)
const from = _Array$from;
const keys = _keys(Stub ?? Object);
const {
  entries
} = Array && _Map;