import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// undecidable conditional fold strips never-branch; only viable branch survives the synth
// union, keeping the surviving member dispatch sound
type Pick<K> = K extends string ? { v: number[] } : never;
declare const p: Pick<'x'>;
_atMaybeArray(_ref = p.v).call(_ref, 0);
_flatMaybeArray(_ref2 = p.v).call(_ref2);