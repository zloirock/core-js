// the value spelled at a write is read through one canon wherever it lands: a pattern write's slot
// (`[k] = [j = V]`), an arm of a branching write, a container slot's write (`w.k = q = V`) and a
// callee's own init (`const mk = q = () => V`) all install the chain's TAIL. the pattern slot and
// the init resolve in both methods; the arm and the slot write join the usage-global union only

let key = 'isArray', k2;
[key] = [k2 = 'fromAsync'];
export const patternSlot = Array[key]([]);

let arm = [Object], a2;
arm = c ? (a2 = [Array]) : [Object];
const [{ from }] = arm;
export const branchingArm = from('ab');

const box = { k: Object };
let s2;
box.k = s2 = Promise;
const { k: { allSettled } } = box;
export const containerSlot = allSettled([]);

let m2;
const mk = m2 = () => globalThis;
export const calleeInit = mk().Array.of(1);
