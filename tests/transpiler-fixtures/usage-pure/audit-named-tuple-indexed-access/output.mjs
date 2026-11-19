import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// Named tuple element with indexed access: `[a: T, b: U][1]` should peel
// TSNamedTupleMember and resolve to the second element type.
type Pair = [items: number[], tags: string[]];
declare const t: Pair;
_includesMaybeArray(_ref = t[1]).call(_ref, 'x');
declare const second: Pair[1];
_flatMaybeArray(second).call(second);