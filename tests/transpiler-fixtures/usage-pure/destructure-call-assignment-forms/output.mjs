import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$log1p from "@core-js/pure/actual/math/log1p";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
const assign = () => ({
  a: Object,
  b: [Math]
});
let viaAssigned, viaAssignedArray;
({
  a: viaAssigned,
  b: [viaAssignedArray]
} = assign());
export const fromAssigned = (viaAssigned === Object ? _Object$assign : viaAssigned.assign.bind(viaAssigned))({}, {});
export const fromAssignedArray = (viaAssignedArray === Math ? _Math$expm1 : viaAssignedArray.expm1.bind(viaAssignedArray))(1);
const keyed = () => ({
  K: 'fromEntries'
});
let K = 'x';
({
  K
} = keyed());
export const viaKey = _Object$fromEntries([]);
const boxed = () => ({
  w: {
    k: String
  }
});
let w = {};
({
  w
} = boxed());
export const viaContainerWrite = _String$fromCodePoint(65);
const headed = () => ({
  a: Math
});
let viaAssignedHead;
for ({
  a: viaAssignedHead
} of [headed()]) use((viaAssignedHead === Math ? _Math$log1p : viaAssignedHead.log1p.bind(viaAssignedHead))(1));
const builtPair = () => [Array];
let viaAssignSibling, besideAssign;
[{
  of: viaAssignSibling
}, besideAssign] = builtPair();
use(viaAssignSibling(26), besideAssign);