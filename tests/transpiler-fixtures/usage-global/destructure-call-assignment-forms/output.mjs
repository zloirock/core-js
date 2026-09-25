import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.math.expm1";
import "core-js/modules/es.math.log1p";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
export const fromAssigned = viaAssigned.assign({}, {});
export const fromAssignedArray = viaAssignedArray.expm1(1);
const keyed = () => ({
  K: 'fromEntries'
});
let K = 'x';
({
  K
} = keyed());
export const viaKey = Object[K]([]);
const boxed = () => ({
  w: {
    k: String
  }
});
let w = {};
({
  w
} = boxed());
export const viaContainerWrite = w.k.fromCodePoint(65);
const headed = () => ({
  a: Math
});
let viaAssignedHead;
for ({
  a: viaAssignedHead
} of [headed()]) use(viaAssignedHead.log1p(1));
const builtPair = () => [Array];
let viaAssignSibling, besideAssign;
[{
  of: viaAssignSibling
}, besideAssign] = builtPair();
use(viaAssignSibling(26), besideAssign);