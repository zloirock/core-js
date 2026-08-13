import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a CONSTANT-literal receiver with a side-effecting key on SIBLING-declarator hosts
// (multi-declarator / for-init): the receiver memo routes through the sibling-aware channel and
// plants as a preceding comma declarator at the source slot, so the extraction reads a declared
// ref. the standalone host keeps the hoisted-statement memo (control).
// sidecar: on the standalone control the emitters agree on values but not on shape - unplugin
// hoists the memo and the effect-free extraction as preceding statements, babel appends a
// trailing comma declarator after the kept-key residual
let k = 0;
var _ref = [7, 8], { [(k++, 'at')]: _unused, other } = _ref, a = _atMaybeArray(_ref), z = 1;
for (var _ref2 = [[1], 2], { [(k++, 'flat')]: _unused2, other2 } = _ref2, f = _flatMaybeArray(_ref2), i = 0; i < 1; i++) console.log(f);
var _ref3 = [5, 6];
var inc = _includesMaybeArray(_ref3);
var { [(k++, 'includes')]: _unused3, other3 } = _ref3;
console.log(a, z, inc, k, other, other2, other3);