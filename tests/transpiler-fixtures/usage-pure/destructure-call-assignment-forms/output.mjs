import _Array$of from "@core-js/pure/actual/array/of";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Math$log1p from "@core-js/pure/actual/math/log1p";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
// the pattern ASSIGNMENT forms pair through the call the same way: object and array slots of the
// write, a computed key resolved through a pattern write, a container primary kept alive by one, the
// for-of assignment head, and the array write beside a bound sibling. one static per row
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
viaAssignSibling = _Array$of;
use(viaAssignSibling(26), besideAssign);