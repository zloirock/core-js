// A write through a conditional, logical or aliased receiver patches every reachable built-in slot. Later static reads must
// observe that patch through the constructor binding.
let cond;
(cond ? Map : Promise).groupBy = patchA;
const r1 = Map.groupBy(items, fn);
export { r1 };
