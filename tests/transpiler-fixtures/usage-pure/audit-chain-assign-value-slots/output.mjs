import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// the value spelled at a write is read through one canon wherever it lands: a pattern write's slot
// (`[k] = [j = V]`), an arm of a branching write, a container slot's write (`w.k = q = V`) and a
// callee's own init (`const mk = q = () => V`) all install the chain's TAIL. the pattern slot and
// the init resolve in both methods; the arm and the slot write join the usage-global union only

let key = 'isArray',
  k2;
[key] = [k2 = 'fromAsync'];
export const patternSlot = _Array$fromAsync([]);
let arm = [Object],
  a2;
arm = c ? a2 = [Array] : [Object];
const [{
  from
}] = arm;
export const branchingArm = from('ab');
const box = {
  k: Object
};
let s2;
box.k = s2 = _Promise;
const {
  k: {
    allSettled
  }
} = box;
export const containerSlot = allSettled([]);
let m2;
const mk = m2 = () => _globalThis;
export const calleeInit = _Array$of(1);