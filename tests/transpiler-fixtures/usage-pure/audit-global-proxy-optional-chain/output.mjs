import _Set from "@core-js/pure/actual/set/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
// optional-chain on global proxy: globalThis?.Map should resolve same as globalThis.Map.
// babel emits OptionalMemberExpression; oxc emits ChainExpression wrapping MemberExpression
const x = _Set.prototype;
const y = _Map.prototype;
x;
y;